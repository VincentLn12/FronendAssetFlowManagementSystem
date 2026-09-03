# AssetFlow Management System Frontend Project (client)

ระบบ Frontend Web Application สำหรับบริหารจัดการ  
- พัสดุ / ครุภัณฑ์  
- การจัดซื้อจัดจ้าง  
- คลังวัสดุ  

พัฒนาด้วย **Angular 21**, **TypeScript**, **TailwindCSS 4**, **Angular Material 21**, **SignalR**, **RxJS**, **Flatpickr**, **SweetAlert2**, และ **Stripe JS**

---

## 📁 โครงสร้างโฟลเดอร์แบบละเอียด (Folder Structure)

```text
client/
├── public/                                # ไฟล์ Static Public (Favicon, Icons, Assets)
├── src/                                   # ซอร์สโค้ดหลักของแอปพลิเคชัน
│   ├── app/                               # [Core Application Architecture]
│   │   ├── core/                          # [Core Singletons Module]
│   │   │   ├── interceptors/              # HTTP Interceptors (JWT Bearer Token, Error Interceptor)
│   │   │   ├── guards/                    # Route Guards (AuthGuard, AdminGuard, RoleGuard)
│   │   │   └── services/                  # Singleton Services (AccountService, BusyService, SignalRService)
│   │   │
│   │   ├── layout/                        # [Global Layout Components]
│   │   │   ├── header/                    # แถบเมนูด้านบน (Header / Navigation Bar)
│   │   │   ├── sidebar/                   # แถบเมนูด้านข้าง (Sidebar Navigation)
│   │   │   └── footer/                    # ส่วนท้ายเว็บไซต์ (Footer Component)
│   │   │
│   │   ├── shared/                        # [Shared Components & Directives]
│   │   │   ├── components/                # คอมโพเนนต์อเนกประสงค์ (Pagination, Modals, Confirm Dialogs)
│   │   │   ├── models/                    # Shared Models / TypeScript Interfaces
│   │   │   └── pipes/                     # Custom Pipes (Thai Date Pipe, Currency Pipe)
│   │   │
│   │   ├── features/                      # [Feature Modules & Pages] (35 ฟีเจอร์หลัก)
│   │   │   ├── account/                   # ระบบเข้าสู่ระบบ / สมัครสมาชิก / โปรไฟล์ผู้ใช้งาน
│   │   │   ├── acquisitionMethod/         # จัดการข้อมูลวิธีการได้มาของทรัพย์สิน
│   │   │   ├── assetCategories/           # จัดการหมวดหมู่ครุภัณฑ์
│   │   │   ├── assetItems/                # จัดการทะเบียนครุภัณฑ์หลัก
│   │   │   ├── assetRepairs/              # ระบบการแจ้งซ่อมและบันทึกประวัติซ่อมแซมครุภัณฑ์
│   │   │   ├── assetSubItemHistory/       # ประวัติการเคลื่อนย้าย/โอนย้ายครุภัณฑ์ย่อย
│   │   │   ├── assetUsageType/            # จัดการประเภทการใช้งานครุภัณฑ์
│   │   │   ├── assetWithdrawal/           # ระบบเบิกจ่าย/ยืม/ครอบครองครุภัณฑ์
│   │   │   ├── assetsubItems/             # จัดการทะเบียนครุภัณฑ์ย่อย (Sub-Items)
│   │   │   ├── budgetsource/              # จัดการแหล่งเงินงบประมาณ
│   │   │   ├── coursesDetail/             # จัดการรายละเอียดหลักสูตร/อบรม
│   │   │   ├── departments/               # จัดการข้อมูลแผนก / คณะ / หน่วยงาน
│   │   │   ├── expenseTypes/              # จัดการประเภทค่าใช้จ่าย
│   │   │   ├── fiscalyears/               # จัดการรอบปีงบประมาณ
│   │   │   ├── fundcategorys/             # จัดการหมวดหมู่เงินงบประมาณ
│   │   │   ├── hireDetails/               # จัดการรายละเอียดสัญญาจัดจ้างทำของ
│   │   │   ├── home/                      # หน้าหลักและภาพรวมระบบ (Dashboard Home)
│   │   │   ├── MaterialItems/             # จัดการทะเบียนพรรณนาวัสดุสิ้นเปลือง
│   │   │   ├── materialIssueDetail/       # ระบบการตัดจ่ายวัสดุออกจากคลัง
│   │   │   ├── materialReceiveDetail/     # ระบบการตรวจรับวัสดุเข้าคลัง
│   │   │   ├── materialStockCard/         # ระบบสต็อกการ์ดคลังวัสดุ (Inventory Ledger Real-time)
│   │   │   ├── materialUnits/             # จัดการหน่วยนับของวัสดุ
│   │   │   ├── materialWithdrawal/        # ระบบจัดการเอกสารใบขอเบิกวัสดุ
│   │   │   ├── operationTypes/            # จัดการประเภทการดำเนินงานจัดซื้อ
│   │   │   ├── positions/                 # จัดการตำแหน่งงานของบุคลากร
│   │   │   ├── prefixes/                  # จัดการคำนำหน้าชื่อ
│   │   │   ├── procurementrecord/         # ระบบบันทึกเอกสารการจัดซื้อจัดจ้างหลัก
│   │   │   ├── projects/                  # จัดการโครงการ/แผนงาน
│   │   │   ├── public-portal/             # ระบบพอร์ตอลสาธารณะสำหรับสแกน QR Code ตรวจสอบครุภัณฑ์
│   │   │   ├── roles/                     # จัดการบทบาทและสิทธิ์การใช้งาน (Roles Management)
│   │   │   ├── settings/                  # จัดการการตั้งค่าระบบ
│   │   │   ├── staffs/                    # จัดการข้อมูลทะเบียนบุคลากร/เจ้าหน้าที่
│   │   │   ├── test-error/                # หน้าทดสอบระบบจัดการ Error Handlers
│   │   │   ├── users/                     # จัดการข้อมูลผู้ใช้งานระบบ
│   │   │   └── vendors/                   # จัดการข้อมูลบริษัท / คู่ค้า / ผู้ขาย / ผู้รับจ้าง
│   │   │
│   │   ├── app.component.ts               # Root Component ของระบบ
│   │   ├── app.config.ts                  # Angular Application Configuration (Providers, Router, Animations)
│   │   └── app.routes.ts                  # App Route Definitions & Lazy Loading Config
│   │
│   ├── environments/                      # [Environment Configurations]
│   │   ├── environment.ts                 # Production Environment Config (API Base URL)
│   │   └── environment.development.ts     # Development Environment Config
│   │
│   ├── shared.service.ts                  # Central Shared Utility Service
│   ├── main.ts                            # จุดเริ่มต้นการ Bootstrap Angular Application
│   ├── styles.scss                        # Global SCSS Styling & Angular Material Custom Theme
│   └── tailwind.css                       # TailwindCSS v4 Directives Configuration
│
├── .angular/                              # ไฟล์ Build Cache ของ Angular CLI
├── .editorconfig                          # การตั้งค่า Code Editor Standard
├── angular.json                           # การตั้งค่า Angular CLI Build/Serve Configuration
├── package.json                           # ไฟล์ระบุ Dependencies และ Scripts ของโปรเจกต์
├── ssl/                                   # Certificate SSL สำหรับการรันในเครื่องท้องถิ่น (HTTPS)
├── tsconfig.json                          # การตั้งค่า TypeScript Compiler หลัก
├── tsconfig.app.json                      # การตั้งค่า TypeScript สำหรับโปรเจกต์แอปพลิเคชัน
└── tsconfig.spec.json                     # การตั้งค่า TypeScript สำหรับ Unit Testing (Vitest)
```

---

## 🌟 คุณสมบัติและฟังก์ชันการทำงานหลัก (Key Features)

### 1) 👥 ระบบสำหรับเจ้าหน้าที่และผู้ใช้งานทั่วไป (User & Staff Portal)

- **หน้าหลัก & แดชบอร์ด (Dashboard Home)**  
  แสดงสถิติสรุปยอดจัดซื้อจัดจ้าง ยอดครุภัณฑ์ในครอบครอง และสถานะวัสดุคงเหลือในคลัง

- **ระบบเบิกจ่ายและครอบครองครุภัณฑ์ (Asset Withdrawal & Usage)**  
  - ค้นหาและทำรายการเบิกจ่าย/ยืมครุภัณฑ์ พร้อมระบุสถานที่ใช้งานและวัตถุประสงค์  
  - ตรวจสอบรายการครุภัณฑ์ที่ตนเองครอบครองอยู่

- **ระบบแจ้งซ่อมแซมครุภัณฑ์ (Asset Repair Request)**  
  - ยื่นเรื่องแจ้งซ่อมครุภัณฑ์ที่ชำรุด พร้อมระบุรายละเอียดปัญหา  
  - ติดตามสถานะการซ่อมแซมและประวัติค่าใช้จ่ายซ่อมแซม

- **ระบบเบิกวัสดุสิ้นเปลือง (Material Request)**  
  ค้นหาพรรณนาวัสดุ ยื่นใบขอเบิกวัสดุ และติดตามสถานะการอนุมัติจ่ายวัสดุ

### 2) 🛡️ ระบบสำหรับผู้ดูแลพัสดุและผู้บริหาร (Admin & Procurement Management Portal)

- **ระบบบริหารการจัดซื้อจัดจ้าง (Procurement Management)**  
  - บันทึกเอกสารการจัดซื้อจัดจ้าง (Procurement Records) เชื่อมโยงปีงบประมาณ แหล่งเงิน โครงการ และผู้ขาย  
  - บันทึกรายละเอียดสัญญาจัดจ้างทำของ (Hire Details)  
  - อัปเดตและติดตามประวัติการเปลี่ยนสถานะเอกสาร (Approved, Pending, Inspection)

- **ระบบทะเบียนและจำหน่ายครุภัณฑ์ (Asset & Sub-Item Management)**  
  - ลงทะเบียนครุภัณฑ์หลัก (Asset Items) และครุภัณฑ์ย่อย (Asset Sub-Items)  
  - ติดตามประวัติการย้ายสถานที่/ผู้ถือครองครุภัณฑ์ย่อย (Asset Sub-Item History)  
  - ทำรายการตัดจำหน่ายครุภัณฑ์ย่อยออกจากบัญชี (Asset Sub-Item Disposal)

- **ระบบบริหารคลังวัสดุและสต็อกการ์ด (Material Inventory & Stock Card Engine)**  
  - บันทึกการตรวจรับวัสดุเข้าคลัง (Material Receive) และการตัดจ่ายวัสดุ (Material Issue)  
  - ระบบสต็อกการ์ด (Material Stock Card) คำนวณยอดยกมา รับเข้า จ่ายออก และยอดคงเหลือแบบ Real-time  
  - ระบบแจ้งเตือนวัสดุใกล้หมดคลัง (Min/Max Quantity Alert)

- **ระบบจัดการข้อมูลหลัก (Master Data Management)**  
  เพิ่ม/แก้ไข/ลบ ข้อมูลโครงสร้างองค์กร เช่น ปีงบประมาณ หมวดเงิน แหล่งเงิน แผนก ตำแหน่ง บุคลากร คู่ค้า หมวดหมู่ครุภัณฑ์ และหน่วยนับ

- **ระบบจัดการสิทธิ์ผู้ใช้งาน (User & Role Management)**  
  จัดการผู้ใช้งาน กำหนดบทบาทและสิทธิ์การเข้าถึงเมนูต่าง ๆ (RBAC)

### 3) 🔍 ระบบบริการสาธารณะและการตรวจสอบ (Public Portal & Verification)

- **สแกน QR Code ตรวจสอบครุภัณฑ์ (QR Code Verification)**  
  หน้าพอร์ตอลสาธารณะสำหรับสแกน QR Code บนตัวครุภัณฑ์ เพื่อดูรายละเอียด หมายเลขครุภัณฑ์ สถานะ และผู้ถือครองโดยไม่ต้องเข้าสู่ระบบ

---

## 🛠️ เทคโนโลยีและไลบรารีที่ใช้ (Tech Stack & Libraries)

| หมวดหมู่ | เทคโนโลยี / ไลบรารี | คำอธิบาย |
|---|---|---|
| Core Framework | Angular 21 | Framework หลักสำหรับพัฒนา SPA แบบ Modern Component Architecture |
| Language | TypeScript 5.9 | ภาษาพัฒนาหลักแบบ Strongly Typed |
| UI Components | Angular Material 21 (`@angular/material`, `@angular/cdk`) | ชุดคอมโพเนนต์ UI มาตรฐาน (Tables, Modals, Forms, Buttons, Datepicker) |
| CSS Framework | TailwindCSS 4 (`tailwindcss`, `@tailwindcss/postcss`) | Utility-first CSS สำหรับจัดการ Styling |
| Reactive Programming | RxJS 7.8 | จัดการ Data Streams และ Async Operations |
| Real-time Communication | Microsoft SignalR Client (`@microsoft/signalr`) | เชื่อมต่อสื่อสารแบบ Real-time กับ Backend |
| Searchable Dropdown | `@ng-select/ng-select`, `ngx-mat-select-search` | Dropdown พร้อมช่องค้นหา |
| Date & Time Picker | `flatpickr`, `angularx-flatpickr` | คอมโพเนนต์ปฏิทินเลือกวันที่ |
| Interactive Alerts | `sweetalert2` | ป๊อปอัปแจ้งเตือนและกล่องยืนยันการทำรายการ |
| Payment Integration | `@stripe/stripe-js` | SDK ชำระเงิน Stripe บนเว็บ |
| Unique ID Generator | `nanoid` | สร้าง ID แบบสุ่มไม่ซ้ำ |
| Unit Testing & Tooling | Vitest, jsdom, Prettier | Unit test และจัดรูปแบบโค้ด |

---

## ⚙️ การติดตั้งและเริ่มใช้งาน (Getting Started)

### 1) ติดตั้ง Dependencies

เปิด Terminal ในโฟลเดอร์ `client` แล้วรัน:

```bash
npm install
```

### 2) กำหนดตัวแปร Environment

ตรวจสอบ/แก้ไขไฟล์ `src/environments/environment.ts` และ `src/environments/environment.development.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7001/api/'
};
```

### 3) รันโปรเจกต์ในโหมดพัฒนา (Development Mode)

```bash
npm start
```

หรือใช้ Angular CLI:

```bash
ng serve
```

แอปจะทำงานที่ `http://localhost:4200` (หรือตามพอร์ตที่กำหนด)

---

## 📜 คำสั่ง Scripts ที่สำคัญ

- `npm start` : เริ่มรัน Dev Server ด้วย Angular CLI (`ng serve`)
- `npm run build` : Build โปรเจกต์สำหรับ Production Deployment (`ng build`)
- `npm run watch` : Build และเฝ้าระวังการเปลี่ยนแปลงโค้ดในโหมด Development
- `npm test` : รัน Unit Testing ของโปรเจกต์ด้วย Vitest (`ng test`)
