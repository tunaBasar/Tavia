#!/bin/bash

# ==========================================
# 🚀 TAVIA V2 - MİKROSERVİS BAŞLATMA SIRASI
# ==========================================

SERVICES=(
  # 0. FAZ: Sistemin Beyni ve Haritası
  "tavia-config-service"
  "tavia-discovery-service"

  # 1. FAZ: Çekirdek Servisler 
  "tavia-tenant-service"
  "tavia-inventory-service"
  
  # 2. FAZ: İş Mantığı Servisleri
  "tavia-crm-service" 
  "tavia-order-service" 
  
  # 3. FAZ: Veri İşleme ve Yapay Zeka
  "tavia-context-service"
  "tavia-ai-service" 
  
  # 4. FAZ: Ağ Geçidi 
  "tavia-api-gateway"
  
  # 5. FAZ: Simülasyon
  "tavia-traffic-simulator"
)

# ==========================================

BASE_DIR=$(pwd)
LOG_DIR="$BASE_DIR/logs"
PID_DIR="$BASE_DIR/pids"

# Renkler
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

mkdir -p "$LOG_DIR" "$PID_DIR"

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
    if [ -d "$BASE_DIR/$svc" ]; then
        if [ -f "$PID_DIR/$svc.pid" ] && ps -p $(cat "$PID_DIR/$svc.pid") > /dev/null; then
            echo -e "${YELLOW}⚠️ $svc zaten çalışıyor.${NC}"
        else
            echo -e "${BLUE}🚀 $svc başlatılıyor...${NC}"
            
            # Başlatma Damgası (>> ile ekleniyor)
            echo -e "\n\n********************************************************" >> "$LOG_DIR/$svc.log"
            echo -e ">>> SERVİS BAŞLATILDI: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_DIR/$svc.log"
            echo -e "********************************************************\n" >> "$LOG_DIR/$svc.log"
            
            cd "$BASE_DIR/$svc"
            
            # İŞTE HAYAT KURTARAN DÜZELTME BURADA: > yerine >> kullanıyoruz!
            nohup ./gradlew bootRun >> "$LOG_DIR/$svc.log" 2>&1 &
            local new_pid=$!
            echo $new_pid > "$PID_DIR/$svc.pid"
            
            echo -e "${CYAN}⏳ $svc ilk kontrol yapılıyor...${NC}"
            sleep 7
            
            if ! ps -p $new_pid > /dev/null; then
                echo -e "${RED}❌ $svc ÇÖKTÜ! Başlatılamadı. Logları incele: ./tavia.sh logs $svc${NC}"
                rm -f "$PID_DIR/$svc.pid"
            elif grep -qi "ERROR" "$LOG_DIR/$svc.log"; then
                echo -e "${RED}⚠️ $svc çalışıyor ama loglarda HATA (ERROR) var!${NC}"
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
    if [ -f "$PID_DIR/$svc.pid" ]; then
        pid=$(cat "$PID_DIR/$svc.pid")
        echo -e "${RED}🛑 $svc durduruluyor...${NC}"
        
        # Durdurma Damgası (>> ile ekleniyor)
        echo -e "\n********************************************************" >> "$LOG_DIR/$svc.log"
        echo -e "<<< SERVİS DURDURULDU: $(date '+%Y-%m-%d %H:%M:%S')" >> "$LOG_DIR/$svc.log"
        echo -e "********************************************************\n" >> "$LOG_DIR/$svc.log"
        
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
        tail -f "$LOG_DIR/$2.log" 
        ;;
    *) 
        echo -e "${CYAN}Kullanım: ./tavia.sh {build|start|stop|status|logs} {servis-adı|all}${NC}" 
        ;;
esac