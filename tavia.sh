#!/bin/bash

# ==========================================
# 🚀 TAVIA V2 - MİKROSERVİS BAŞLATMA SIRASI
# ==========================================

# --- SİSTEM KAYNAK YÖNETİMİ (RAM SINIRLAMASI) ---
# Her servis için Başlangıç: 128MB, Maksimum: 384MB
SPRING_JVM_ARGS="-Xms128m -Xmx384m"

SERVICES=(
  # 0. FAZ: Sistemin Beyni ve Haritası (Altyapı)
  "tavia-config-service"
  "tavia-discovery-service"

  # 1. FAZ: Çekirdek Servisler (Temel Veri ve Tanımlar)
  "tavia-tenant-service"
  "tavia-inventory-service"
  "tavia-catalog-service"   # EKLENDİ: Reçete ve ürünlerin temeli. Order'dan önce kalkmalı!
  
  # 2. FAZ: İş Mantığı ve Otonom İcra (Operasyon)
  "tavia-crm-service" 
  "tavia-order-service"     # Sipariş geldiğinde catalog-service'e soracak.
  "tavia-iot-service"       # EKLENDİ: Fiziksel üretim katmanı. Inventory'ye Kafka event'i atacak.
  
  # 3. FAZ: Veri İşleme ve Yapay Zeka (Analiz ve Optimizasyon)
  "tavia-context-service"
  "tavia-ai-service" 
  
  # 4. FAZ: Ağ Geçidi (Dışa Açılan Kapı)
  "tavia-api-gateway"
  
  # 5. FAZ: Simülasyon (Sistemi Test Eden Aktörler)
  "tavia-traffic-simulator"
)

# ==========================================

BASE_DIR=$(pwd)
LOG_DIR="$BASE_DIR/logs"
PID_DIR="$BASE_DIR/pids"
ERR_DIR="$LOG_DIR/errors"

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Klasörleri oluştur
mkdir -p "$LOG_DIR" "$ERR_DIR" "$PID_DIR"

function build_service() {
    local svc=$1
    if [ -d "$BASE_DIR/$svc" ]; then
        echo -e "${MAGENTA}🔨 $svc derleniyor (Clean Build)...${NC}"
        cd "$BASE_DIR/$svc"
        ./gradlew clean build --refresh-dependencies -x test
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ $svc build başarılı!${NC}"
        else
            echo -e "${RED}❌ $svc build HATALI! Lütfen kodu kontrol et.${NC}"
        fi
    else
        echo -e "${RED}❌ $svc klasörü bulunamadı!${NC}"
    fi
}

function start_service() {
    local svc=$1
    local log_file="$LOG_DIR/$svc.log"
    local err_file="$ERR_DIR/$svc-error.log"
    
    if [ -d "$BASE_DIR/$svc" ]; then
        if [ -f "$PID_DIR/$svc.pid" ] && ps -p $(cat "$PID_DIR/$svc.pid") > /dev/null; then
            echo -e "${YELLOW}⚠️ $svc zaten çalışıyor.${NC}"
        else
            echo -e "${BLUE}🚀 $svc başlatılıyor (Max RAM: 384MB)...${NC}"
            
            # --- NORMAL LOG DAMGASI ---
            echo -e "\n\n********************************************************" >> "$log_file"
            echo -e ">>> SERVİS BAŞLATILDI: $(date '+%Y-%m-%d %H:%M:%S')" >> "$log_file"
            echo -e "********************************************************\n" >> "$log_file"
            
            # --- ERROR LOG DAMGASI ---
            echo -e "\n\n********************************************************" >> "$err_file"
            echo -e ">>> SERVİS BAŞLATILDI: $(date '+%Y-%m-%d %H:%M:%S')" >> "$err_file"
            echo -e "********************************************************\n" >> "$err_file"
            
            cd "$BASE_DIR/$svc"
            
            # stdout (1) normal loga, stderr (2) error loga yönlendiriliyor
            nohup ./gradlew bootRun -Dspring-boot.run.jvmArguments="$SPRING_JVM_ARGS" >> "$log_file" 2>> "$err_file" &
            local new_pid=$!
            echo $new_pid > "$PID_DIR/$svc.pid"
            
            echo -e "${CYAN}⏳ $svc ilk kontrol yapılıyor...${NC}"
            sleep 7
            
            if ! ps -p $new_pid > /dev/null; then
                echo -e "${RED}❌ $svc ÇÖKTÜ! Başlatılamadı. Hata logunu incele: tail -f $err_file${NC}"
                rm -f "$PID_DIR/$svc.pid"
            elif grep -qi "ERROR" "$log_file" || [ -s "$err_file" ] && grep -qi "[a-zA-Z]" "$err_file"; then
                echo -e "${RED}⚠️ $svc çalışıyor ama loglarda HATA (ERROR) veya uyarı var!${NC}"
            else
                echo -e "${GREEN}✅ $svc PID: $new_pid ile aktif.${NC}"
            fi
        fi
    else
        echo -e "${RED}❌ $svc klasörü bulunamadı!${NC}"
    fi
}

function stop_service() {
    local svc=$1
    local log_file="$LOG_DIR/$svc.log"
    local err_file="$ERR_DIR/$svc-error.log"
    
    if [ -f "$PID_DIR/$svc.pid" ]; then
        pid=$(cat "$PID_DIR/$svc.pid")
        echo -e "${RED}🛑 $svc durduruluyor...${NC}"
        
        # --- NORMAL LOG DAMGASI ---
        echo -e "\n********************************************************" >> "$log_file"
        echo -e "<<< SERVİS DURDURULDU: $(date '+%Y-%m-%d %H:%M:%S')" >> "$log_file"
        echo -e "********************************************************\n" >> "$log_file"
        
        # --- ERROR LOG DAMGASI ---
        echo -e "\n********************************************************" >> "$err_file"
        echo -e "<<< SERVİS DURDURULDU: $(date '+%Y-%m-%d %H:%M:%S')" >> "$err_file"
        echo -e "********************************************************\n" >> "$err_file"
        
        kill -9 $pid 2>/dev/null || true
        rm -f "$PID_DIR/$svc.pid"
    fi
}

# --- KOMUT YÖNETİMİ ---
case "$1" in
    build)
        if [ "$2" == "all" ]; then
            echo -e "${YELLOW}Tüm sistem derleniyor (Build)...${NC}"
            for s in "${SERVICES[@]}"; do build_service $s; done
            echo -e "${GREEN}🎉 Bütün servislerin build işlemi tamamlandı!${NC}"
        else
            build_service $2
        fi
        ;;
    start) 
        if [ "$2" == "all" ]; then
            echo -e "${YELLOW}Tüm sistem Boot Sırasına göre başlatılıyor...${NC}"
            for s in "${SERVICES[@]}"; do 
                start_service $s
                echo -e "${YELLOW}Bir sonraki servise geçmeden önce 10 saniye bekleniyor...${NC}"
                sleep 10
            done
            echo -e "${GREEN}🎉 Bütün servisler ateşlendi!${NC}"
        else
            start_service $2
        fi 
        ;;
    stop) 
        if [ "$2" == "all" ]; then
            for s in "${SERVICES[@]}"; do stop_service $s; done
        else
            stop_service $2
        fi 
        ;;
    status) 
        echo -e "${YELLOW}--- Durum Ekranı ---${NC}"
        for s in "${SERVICES[@]}"; do
            if [ -f "$PID_DIR/$s.pid" ] && ps -p $(cat "$PID_DIR/$s.pid") > /dev/null; then 
                echo -e "$s: ${GREEN}ÇALIŞIYOR${NC}"
            else 
                echo -e "$s: ${RED}DURMUŞ${NC}"
            fi
        done 
        ;;
    logs) 
        if [ "$3" == "error" ]; then
            tail -f "$ERR_DIR/$2-error.log"
        else
            tail -f "$LOG_DIR/$2.log" 
        fi
        ;;
    *) 
        echo -e "${CYAN}Kullanım: ./tavia.sh {build|start|stop|status|logs} {servis-adı|all} [error]${NC}"
        echo -e "${CYAN}Örnek Hata Logu İzleme: ./tavia.sh logs tavia-crm-service error${NC}"
        ;;
esac