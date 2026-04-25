Aşağıdaki doküman bir “görev listesi” değil. Bu bir operasyon planıdır. Ajanın hata yapacağı yerler önceden düşünülmüş, sınırlar çizilmiş, serbestlik alanı kontrollü bırakılmıştır. Eğer ajan bu plana sadık kalırsa sistem evrilir. Kalmazsa parçalanır.

---

# **TAVIA_MASTER_PLAN.md**

## **1. MİSYON TANIMI**

Amaç:
`tavia_v2` mikroservis sistemini, basit sipariş işleyen bir yapıdan çıkarıp **Contextual AI + Loyalty-driven SaaS platformuna** dönüştürmek.

Bu dönüşüm:

* **Veri zenginliği (enrichment)**
* **Karar üretimi (AI / rule engine)**
* **Servisler arası bağlamsal iletişim**

üzerine kuruludur.

---

## **2. OPERASYONEL PRENSİPLER (NON-NEGOTIABLE RULES)**

### **2.1 Otonomi Kuralları**

* İnsan müdahalesi YOK.
* Derleme hatası alırsan:

  * Maksimum **3 kez** çözmeyi dene.
  * Çözemezsen:

    * `ERROR_LOG.md` dosyasına yaz
    * O servisi bırak → diğer faza geç
* Tamamlanan her iş:

  * `[x]` ile işaretlenecek

---

### **2.2 Sürüm Tutarlılığı (KRİTİK)**

Referans dosya:

```
tavia-order-service/build.gradle
```

Aşağıdakiler **birebir kopyalanacak**:

* Spring Boot versiyonu
* Java versiyonu
* Dependency versiyonları
* Plugin konfigürasyonları

⚠️ Yeni servislerde “kafadan versiyon seçmek” YASAK.

---

### **2.3 Gateway Kuralı (KRİTİK)**

Spring Boot 3.4.x → WebFlux route yapısı:

```
spring:
  cloud:
    gateway:
      server:
        webflux:
          routes:
```

⚠️ Eski yapı (`spring.cloud.gateway.routes`) KULLANILMAYACAK.

---

### **2.4 Kafka Güvenlik Kuralı (KRİTİK)**

Tüm consumer’larda:

* `ErrorHandlingDeserializer` ZORUNLU
* `spring.json.trusted.packages: "*"` ZORUNLU

Amaç:
→ Poison Pill mesajlarının sistemi kilitlemesini önlemek

---

### **2.5 Veritabanı Standardı (GLOBAL)**

Tüm servisler:

```
PostgreSQL
jdbc:postgresql://localhost:5432/tavia_db
username: tavia_user
password: tavia_password
ddl-auto: update
```

⚠️ Farklı DB kullanmak YASAK.

---

## **3. GENEL MİMARİ STRATEJİ**

Yeni sistemin omurgası:

* **Order → Enrichment → Kafka → AI Decision**
* **Customer + Context → AI Input Layer**

Yeni veri akışı:

```
Order Service
   ↓
(CRM + Context enrichment)
   ↓
Kafka (enriched event)
   ↓
AI Service (rule engine)
```

---

## **4. FAZ 1 — tavia-crm-service (Port: 8086)**

### **Amaç**

Müşteri verisini ve sadakat seviyesini yönetmek.

### **Zorunlu Domain Model**

* Customer

  * id
  * name
  * email
  * totalSpent
  * loyaltyLevel (ENUM: BRONZE, SILVER, GOLD)

### **Zorunlu Özellikler**

* CRUD REST API
* JPA + PostgreSQL
* Basit validasyonlar

### **Beklenen Çıktı**

* Çalışan servis
* Veri persist edilebiliyor
* JSON üzerinden erişilebilir

---

## **5. FAZ 2 — tavia-context-service (Port: 8087)**

### **Amaç**

Sisteme çevresel bağlam sağlamak.

### **Dönen Veri (Stateless olabilir)**

* weather (SUNNY, RAINY, CLOUDY)
* activeEvent (NONE, EXAM_WEEK, HOLIDAY)
* competitorIntensity (LOW, MEDIUM, HIGH)

### **Zorunlu Özellikler**

* REST endpoint (GET)
* Mock data üretimi (hardcoded olabilir)

### **Beklenen Çıktı**

* Anlık context dönebilen servis

---

## **6. FAZ 3 — tavia-order-service GÜNCELLEME**

### **Mevcut Durum**

* Sipariş alıyor
* Kafka’ya atıyor

### **Yeni Davranış (KRİTİK)**

Kafka’ya göndermeden önce:

#### **1. CRM çağrısı**

* Customer bilgisi çekilecek

#### **2. Context çağrısı**

* Anlık durum çekilecek

#### **3. Enrichment**

Sipariş şu bilgilerle genişletilecek:

* customerLevel
* totalSpent
* weather
* activeEvent
* competitorIntensity

---

### **Dayanıklılık (RESILIENCE)**

ZORUNLU:

* Circuit Breaker
* Fallback mekanizması

Fallback durumunda:

```
customerLevel = UNKNOWN
weather = UNKNOWN
```

⚠️ Sipariş ASLA fail olmamalı.

---

### **Beklenen Çıktı**

* Kafka’ya artık “zenginleştirilmiş event” gider

---

## **7. FAZ 4 — tavia-ai-service GÜNCELLEME**

### **Mevcut Durum**

* Kafka dinliyor
* DB’ye yazıyor

### **Yeni Davranış**

#### **1. Yeni Event Yapısı**

* Enriched order payload okunacak

#### **2. Veritabanı Güncellemesi**

Yeni alanlar:

* weather
* loyaltyLevel
* eventType

---

### **3. Mock Rule Engine (KRİTİK)**

Basit ama genişletilebilir kurallar:

Örnek:

```
IF weather == RAINY AND loyaltyLevel == GOLD
THEN suggest = "Increase Latte price by 5%"
```

```
IF competitorIntensity == HIGH
THEN suggest = "Apply discount campaign"
```

⚠️ Hardcoded olabilir ama genişletilebilir yapı tercih edilmeli.

---

### **Beklenen Çıktı**

* AI servis karar üretir hale gelir
* DB’de enriched veri tutulur

---

## **8. FAZ 5 — API GATEWAY GÜNCELLEME**

### **Amaç**

Yeni servisleri dış dünyaya açmak.

### **Eklenecek Rotalar**

* `/crm/**` → 8086
* `/context/**` → 8087

### **KRİTİK**

Route config:

```
spring.cloud.gateway.server.webflux.routes
```

---

## **9. DOĞRULAMA KRİTERLERİ (DONE DEFINITION)**

Ajan bir fazı bitirdi sayılmak için:

* Servis ayağa kalkmalı
* Endpoint çalışmalı
* Kafka akışı bozulmamalı
* DB yazımı başarılı olmalı

---

## **10. HATA YÖNETİMİ**

`ERROR_LOG.md` formatı:

```
[FAILED SERVICE]: tavia-xxx-service
[ERROR]: <stacktrace kısa özet>
[ATTEMPTS]: 3
[ACTION]: SKIPPED
```

---

## **11. OPERASYON AKIŞI (CHECKLIST)**

```
[ ] FAZ 1 — CRM Service
[ ] FAZ 2 — Context Service
[ ] FAZ 3 — Order Service Update
[ ] FAZ 4 — AI Service Update
[ ] FAZ 5 — Gateway Update
```

---

## **12. STRATEJİK NOT**

Bu sistemin gücü:

* Veri zenginliğinden
* Servisler arası doğru kontratlardan
* Ve hataya dayanıklılıktan gelir

Zayıf entegrasyon = sistem çöküşü.

---

