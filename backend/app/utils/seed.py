import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.db.supabase_client import get_supabase_admin_client
from app.services.vector_store import ingest_policy_document
from dotenv import load_dotenv

load_dotenv()

POLICIES = [
    # ─── IQAMA & RESIDENCY ────────────────────────────────────────────────────
    {
        "title": "Iqama (Residency Permit) — Types, Requirements & Renewal",
        "language": "en",
        "source_url": "https://www.moi.gov.sa/en/services/Pages/eservices.aspx",
        "content": """
The Iqama is the official residency permit issued by the Ministry of Interior (MOI) to all expatriates residing in Saudi Arabia.
It must be carried at all times and renewed annually or as specified.

TYPES OF IQAMA:
- Work Iqama: For expatriates employed by a Saudi sponsor (kafeel). Tied to the employer.
- Accompanying Family Iqama: Issued to spouse and children (under 18) of a work permit holder.
- Special Residency Iqama (Premium Residency): A new initiative allowing qualified expatriates to live and work freely without a Saudi sponsor.

REQUIREMENTS FOR FIRST-TIME IQAMA:
1. Valid entry visa stamped in passport
2. Medical fitness certificate from an approved Saudi health center
3. Clear criminal record from home country (authenticated)
4. Passport valid for at least 6 months
5. Passport-size photos (white background)
6. Employment contract stamped by MHRSD
7. Kafeel (sponsor) must initiate the application on Absher

IQAMA RENEWAL:
- Renewal must be done within 3 months before expiry. Late renewal incurs a fine of SAR 200/month.
- Max fine for overstaying without valid Iqama: SAR 10,000.
- Required documents: valid passport, current Iqama, employer letter, GOSI subscription proof.
- Process through Absher (absher.com.sa) online portal within minutes.

FEES:
- Annual Iqama fee: SAR 650–800 depending on profession category.
- Accompanying family member: SAR 400/year per member.

VIOLATION PENALTIES:
- Iqama expiry without renewal: SAR 200/month fine.
- Working without Iqama: deportation and 3-year entry ban.
- Absconding from sponsor: triggers flagging on MOI system.

STATUS CHECK: Visit absher.com.sa → Individuals → View Iqama status.
        """.strip(),
    },
    {
        "title": "إقامة - أنواعها ومتطلباتها وتجديدها",
        "language": "ar",
        "source_url": "https://www.moi.gov.sa/ar/services/Pages/eservices.aspx",
        "content": """
الإقامة هي وثيقة إقامة رسمية تصدرها وزارة الداخلية لجميع المقيمين الأجانب في المملكة العربية السعودية.

أنواع الإقامة:
- إقامة العمل: للموظفين الأجانب المرتبطين بكفيل سعودي.
- إقامة مرافقة: تصدر للزوج والأطفال دون 18 عامًا.
- الإقامة المميزة (Premium Residency): تتيح للأجانب المؤهلين الإقامة والعمل بحرية دون كفيل.

شروط استخراج الإقامة لأول مرة:
1. تأشيرة دخول سارية
2. شهادة لياقة طبية من مركز صحي معتمد
3. شهادة حسن سيرة وسلوك من البلد الأصلي
4. جواز سفر ساري لمدة 6 أشهر على الأقل
5. صور شخصية (خلفية بيضاء)
6. عقد عمل مصدق من وزارة الموارد البشرية

التجديد:
- يجب التجديد قبل 3 أشهر من انتهاء الصلاحية. غرامة التأخير: 200 ريال شهريًا.
- الحد الأقصى للغرامة: 10,000 ريال.

الرسوم: 650–800 ريال سنويًا حسب المهنة. 400 ريال/سنة للمرافقين.
        """.strip(),
    },

    # ─── BUSINESS REGISTRATION ────────────────────────────────────────────────
    {
        "title": "Commercial Registration (CR) and Business Licensing in Saudi Arabia",
        "language": "en",
        "source_url": "https://mc.gov.sa/en/services/Pages/CommercialRegist.aspx",
        "content": """
Starting a business in Saudi Arabia requires obtaining a Commercial Registration (CR) from the Ministry of Commerce (MOCI).

WHO CAN REGISTER:
- Saudi nationals: 100% ownership allowed in most sectors.
- GCC nationals: Similar rights as Saudis in most business activities.
- Foreign investors: Through MISA (Ministry of Investment of Saudi Arabia) for a foreign investment license.

STEPS TO REGISTER A COMPANY (Saudi National):
1. Reserve your company name via Meras portal (meras.mc.gov.sa).
2. Authenticate ID and partner agreements (via Notary Public).
3. Register with MOCI to obtain Commercial Registration (CR) number.
4. Register with Zakat, Tax and Customs Authority (ZATCA) for Tax ID.
5. Register with GOSI (General Organization for Social Insurance).
6. Open a commercial bank account.
7. Obtain a municipal license from your local municipality.

FOREIGN COMPANY REQUIREMENTS (via MISA):
- Apply for an investment license at invest.gov.sa.
- Minimum capital varies by sector (e.g., SAR 500,000 for a foreign LLC).
- Must have a local Saudi partner holding at least 25% in some sectors.
- 100% foreign ownership now permitted in 100+ economic activities.

KEY DOCUMENTS:
- National ID / Iqama
- Partnership agreement (notarized)
- Articles of Association
- Lease agreement for business premises
- Activity-specific approvals (e.g., health, food, education sectors)

FEES: CR issuance: SAR 1,200/year. Renewal: Same annually.

MERAS PORTAL: meras.mc.gov.sa — single window for all business registration.
TIMELINE: Usually 1–3 business days for standard registrations online.

VISION 2030 INCENTIVES:
- 0% corporate income tax for foreign investors in Special Economic Zones (SEZs).
- MISA provides full support for investment setup, licenses, and permits.
        """.strip(),
    },
    {
        "title": "السجل التجاري وترخيص الأعمال في المملكة العربية السعودية",
        "language": "ar",
        "source_url": "https://mc.gov.sa/ar/services/Pages/CommercialRegist.aspx",
        "content": """
لبدء نشاط تجاري في المملكة يجب الحصول على سجل تجاري من وزارة التجارة.

خطوات التسجيل:
1. حجز اسم المنشأة عبر بوابة مِرَاس (meras.mc.gov.sa)
2. توثيق الهوية وعقود الشراكة
3. التسجيل في وزارة التجارة للحصول على السجل التجاري
4. التسجيل في هيئة الزكاة والضريبة والجمارك للحصول على الرقم الضريبي
5. التسجيل في التأمينات الاجتماعية (GOSI)
6. فتح حساب مصرفي تجاري
7. الحصول على رخصة بلدية

الرسوم: 1,200 ريال سنويًا لإصدار السجل التجاري وتجديده.
البوابة الإلكترونية: meras.mc.gov.sa — نافذة موحدة لكافة خدمات التسجيل التجاري.
        """.strip(),
    },

    # ─── VAT & ZATCA ─────────────────────────────────────────────────────────
    {
        "title": "VAT Registration, Rates, Filing and Penalties — ZATCA Saudi Arabia",
        "language": "en",
        "source_url": "https://zatca.gov.sa/en/VAT/Pages/default.aspx",
        "content": """
Value Added Tax (VAT) in Saudi Arabia is managed by the Zakat, Tax and Customs Authority (ZATCA).

CURRENT VAT RATE: 15% (raised from 5% in July 2020).
ZERO-RATED GOODS: Exports, international transport, medicines, medical equipment.
EXEMPT GOODS: Financial services (some), residential rental (long-term), local passenger transport.

WHO MUST REGISTER:
- Mandatory registration: Businesses with annual taxable supplies exceeding SAR 375,000.
- Voluntary registration: Businesses with supplies between SAR 187,500–375,000.
- Non-residents supplying goods/services in KSA must register regardless of threshold.

REGISTRATION PROCESS:
1. Log in to Fatoorah portal: my.zatca.gov.sa
2. Submit registration application with CR number, bank details, and estimated annual revenue.
3. Receive a VAT registration certificate (usually within 5 business days).

FILING FREQUENCY:
- Large taxpayers (annual revenue > SAR 40 million): Monthly filing.
- Others: Quarterly filing.
- Deadline: 30 days after the end of the tax period.

INVOICING (E-INVOICING — Fatoorah):
- Phase 1 (December 2021): All registered businesses must issue electronic invoices.
- Phase 2 (rollout since 2023): Integration with ZATCA systems for real-time reporting.
- Non-compliance fines up to SAR 50,000.

PENALTIES:
- Late registration: 5%–25% of annual due tax.
- Late filing: 5%–25% of tax due.
- Incorrect invoicing: SAR 1,000 per invoice up to SAR 50,000.
- Tax evasion: Up to triple the evaded amount.

REFUNDS: Businesses can apply for VAT refunds if input tax exceeds output tax. Apply via my.zatca.gov.sa.
        """.strip(),
    },
    {
        "title": "ضريبة القيمة المضافة - التسجيل والمعدلات والإيداع والغرامات",
        "language": "ar",
        "source_url": "https://zatca.gov.sa/ar/VAT/Pages/default.aspx",
        "content": """
تُدار ضريبة القيمة المضافة في المملكة العربية السعودية من قِبَل هيئة الزكاة والضريبة والجمارك (زاتكا).

معدل ضريبة القيمة المضافة الحالي: 15٪
السلع المعفاة: الخدمات المالية، الإيجار السكني طويل الأمد، نقل الركاب المحلي.
السلع ذات نسبة الصفر: الصادرات، الأدوية، المعدات الطبية.

من يجب أن يسجل:
- التسجيل الإلزامي: المنشآت التي تتجاوز إمداداتها الخاضعة للضريبة 375,000 ريال سنويًا.
- التسجيل الاختياري: بين 187,500 و375,000 ريال.

خطوات التسجيل: عبر بوابة فاتورة my.zatca.gov.sa

الغرامات:
- التسجيل المتأخر: 5٪ إلى 25٪ من الضريبة السنوية.
- التقديم المتأخر: 5٪ إلى 25٪ من الضريبة المستحقة.
- التهرب الضريبي: ما يصل إلى ثلاثة أضعاف المبلغ المتهرب منه.
        """.strip(),
    },

    # ─── LABOR LAW ───────────────────────────────────────────────────────────
    {
        "title": "Saudi Labor Law — Working Hours, Leave Entitlements, and End of Service Benefits",
        "language": "en",
        "source_url": "https://mhrsd.gov.sa/en/labor-law",
        "content": """
Saudi Labor Law is governed by the Ministry of Human Resources and Social Development (MHRSD).

WORKING HOURS:
- Standard: 8 hours/day, 48 hours/week.
- During Ramadan: Reduced to 6 hours/day, 36 hours/week for Muslim employees.
- Overtime: Paid at 150% of normal wage for hours beyond standard.

PROBATION PERIOD:
- Maximum 90 days (may be extended by mutual agreement, but not beyond 180 days).
- Either party may terminate during probation without compensation.

ANNUAL LEAVE:
- Less than 5 years of service: 21 days per year.
- 5+ years of service: 30 days per year.
- Leave allowance must be paid BEFORE the employee takes leave.

SICK LEAVE (per year):
- First 30 days: Full salary.
- Next 60 days: 75% salary.
- Remaining 30 days: No salary (after which contract may be terminated).

MATERNITY LEAVE:
- 10 weeks fully paid (can be taken 4 weeks before expected delivery date).
- Extension of 1 month unpaid possible after the 10 weeks.

HAJJ LEAVE:
- One-time 10-day paid leave for employees who have not performed Hajj and have worked for 2+ years.

NOTICE PERIOD FOR TERMINATION:
- Fixed-term contracts: 30 days' notice by either party.
- Indefinite contracts: 60 days' notice.
- Immediate termination by employer: Only for gross misconduct (Article 80 of Labor Law).

END OF SERVICE GRATUITY (EOSG):
- For less than 5 years: 1/3 month salary per year of service.
- 5–10 years: 2/3 month salary per year.
- 10+ years: 1 full month salary per year.
- Resignation (< 2 years): No EOSG.
- Resignation (2–10 years): 1/3 of full EOSG.
- Resignation (10+ years): Full EOSG.

WAGE PROTECTION SYSTEM (WPS):
- All employers must pay salaries through the Wage Protection System.
- Non-compliance results in suspension of government services for the employer.

MUSANED PLATFORM (musaned.com.sa): For domestic worker contracts and dispute resolution.
        """.strip(),
    },
    {
        "title": "نظام العمل السعودي — ساعات العمل والإجازات ومكافأة نهاية الخدمة",
        "language": "ar",
        "source_url": "https://mhrsd.gov.sa/ar/labor-law",
        "content": """
يُنظِّم نظامَ العمل في المملكة العربية السعودية وزارةُ الموارد البشرية والتنمية الاجتماعية.

ساعات العمل: 8 ساعات يوميًا، 48 ساعة أسبوعيًا. خلال رمضان: 6 ساعات يوميًا للموظفين المسلمين.
العمل الإضافي: يُدفع بنسبة 150٪ من الأجر العادي.

الإجازة السنوية:
- أقل من 5 سنوات خدمة: 21 يومًا في السنة.
- 5 سنوات فأكثر: 30 يومًا في السنة.

إجازة المرض (سنويًا): 30 يومًا بأجر كامل، ثم 60 يومًا بـ75٪ من الأجر، ثم 30 يومًا بدون أجر.

إجازة الأمومة: 10 أسابيع بأجر كامل.

مكافأة نهاية الخدمة:
- أقل من 5 سنوات: ثلث الشهر عن كل سنة خدمة.
- من 5 إلى 10 سنوات: ثلثا الشهر عن كل سنة.
- أكثر من 10 سنوات: شهر كامل عن كل سنة خدمة.
        """.strip(),
    },

    # ─── TRAFFIC VIOLATIONS ───────────────────────────────────────────────────
    {
        "title": "Traffic Violations, Fines, and Appeal Process — Saudi Arabia",
        "language": "en",
        "source_url": "https://www.absher.sa/portal/citizen/home.html",
        "content": """
Traffic violations in Saudi Arabia are managed by the General Directorate of Traffic (Moroor) under the Ministry of Interior.

COMMON VIOLATIONS AND FINES:
- Speeding (1–20 km/h over limit): SAR 150
- Speeding (21–40 km/h over limit): SAR 300
- Speeding (41–60 km/h over limit): SAR 600
- Speeding (61+ km/h over limit): SAR 900 + vehicle impound
- Running a red light: SAR 3,000 + license suspension (30 days)
- Using a mobile phone while driving: SAR 500
- Not wearing a seatbelt: SAR 150 (driver), SAR 150/passenger
- Wrong-way driving: SAR 3,000
- Illegal parking: SAR 100–500 depending on location
- Driving without a license: SAR 5,000 + vehicle impound
- Driving an unlicensed vehicle: SAR 3,000
- Drunk driving: SAR 5,000 + arrest + vehicle impound
- Reckless driving: SAR 3,000 + vehicle impound

POINTS SYSTEM:
- Each violation carries demerit points (1–12 points).
- Accumulating 24 points results in a 3-month license suspension.
- Accumulating 36 points: 6-month suspension.
- 48 points: License revoked permanently.

CHECKING YOUR VIOLATIONS:
- Visit absher.com.sa → Individuals → Traffic Services → View Violations.
- Or use Moroor app (Saudi Traffic App).
- SMS notification is sent to registered mobile number.

PAYING FINES:
- Online: absher.com.sa or sadad.sa
- Bank branches / ATMs
- Post offices
- Deadline: Pay within 15 days to avoid additional 25% surcharge.

APPEALING A FINE:
- You have 30 days from the violation date to appeal.
- Submit appeal through: absher.com.sa → Traffic Services → Submit Traffic Objection.
- Required: violation number, photo evidence (if any), valid ID/Iqama.
- Grounds for appeal: camera malfunction, vehicle was not under your control, stolen vehicle, incorrect citation.
- Average decision time: 15–30 working days.

VEHICLE IMPOUND RELEASE:
- Pay all outstanding fines.
- Present valid Iqama/National ID.
- Provide proof of valid registration (Istimara).
- Visit the nearest Moroor office or impound facility.
        """.strip(),
    },
    {
        "title": "المخالفات المرورية والغرامات وإجراءات الاعتراض في المملكة العربية السعودية",
        "language": "ar",
        "source_url": "https://www.absher.sa/portal/citizen/home.html",
        "content": """
تُدار المخالفات المرورية في المملكة العربية السعودية من قِبَل الإدارة العامة للمرور (المرور) التابعة لوزارة الداخلية.

أبرز المخالفات والغرامات:
- تجاوز السرعة (1-20 كم/س): 150 ريال
- قطع الإشارة الحمراء: 3,000 ريال + إيقاف الرخصة 30 يومًا
- استخدام الجوال أثناء القيادة: 500 ريال
- عدم ربط حزام الأمان: 150 ريال
- القيادة في الاتجاه المعاكس: 3,000 ريال
- القيادة بدون رخصة: 5,000 ريال + الاستيلاء على المركبة

الاستعلام عن المخالفات: بوابة أبشر (absher.com.sa) → الخدمات المرورية.

سداد الغرامات: أبشر، سداد، أو فروع البنوك. الموعد النهائي: 15 يومًا لتجنب 25٪ رسوم إضافية.

الاعتراض على المخالفة:
- يجب تقديم الاعتراض خلال 30 يومًا من تاريخ المخالفة.
- عبر: absher.com.sa → الخدمات المرورية → تقديم اعتراض مروري.
        """.strip(),
    },

    # ─── DRIVING LICENSE ─────────────────────────────────────────────────────
    {
        "title": "Driving License — Application, Transfer, and Renewal in Saudi Arabia",
        "language": "en",
        "source_url": "https://www.moroor.gov.sa/en",
        "content": """
The General Directorate of Traffic (Moroor) manages all driving license services.

FIRST-TIME LICENSE (Saudi National / Resident):
Requirements:
1. Valid Iqama or National ID
2. Medical fitness certificate (vision test, etc.)
3. Pass the theory test (traffic rules exam)
4. Pass the practical driving test
5. Pay fees: SAR 400 for license + test fees

TRANSFERRING A FOREIGN LICENSE:
Citizens of certain countries (USA, UK, France, Germany, GCC countries, and others) may transfer their foreign license without taking a driving test.
Required: Original foreign license + notarized Arabic translation, Iqama, eye test.

LICENSE RENEWAL:
- Valid for 10 years for Saudis; tied to Iqama validity for expats.
- Renew online at absher.com.sa or at any Moroor branch.
- Fee: SAR 400.

LICENSE CATEGORIES:
- Category 1: Light vehicles (passenger cars).
- Category 2: Heavy vehicles (trucks, buses).
- Category 3: Motorcycles.

INTERNATIONAL DRIVING PERMIT (IDP):
- Available at Moroor offices.
- Valid for 1 year alongside the original Saudi license.
        """.strip(),
    },

    # ─── HEALTH INSURANCE / CCHI ─────────────────────────────────────────────
    {
        "title": "Compulsory Health Insurance for Expats — CCHI Saudi Arabia",
        "language": "en",
        "source_url": "https://cchi.gov.sa/en",
        "content": """
The Council of Cooperative Health Insurance (CCHI) mandates health insurance for all expatriates and their dependents in Saudi Arabia.

WHO IS COVERED:
- All non-Saudi employees and their dependents.
- Domestic workers (since November 2023 full enforcement).
- Saudis are covered under government health programs.

EMPLOYER OBLIGATIONS:
- Employers must provide health insurance to all employees before Iqama issuance or renewal.
- Failure to provide insurance results in refusal of Iqama renewal and government service suspension.

WASFATY & SEHHATY:
- Sehhaty app: Government health app for booking appointments, prescription refills, vaccine records.
- Wasfaty: E-prescriptions system used by all licensed pharmacies.

BASIC BENEFIT PLAN (BBP):
- Minimum required coverage for low-wage workers.
- Covers emergency care, outpatient, inpatient, maternity (basic).
- Annual premium: SAR 500–1,200 depending on age and plan.

COMPLAINTS:
- File insurance disputes through CCHI portal: cchi.gov.sa.
- Or through the unified complaints number: 8004270000.

NETWORK HOSPITALS:
- Insurance company provides a list of approved hospitals and clinics in their network.
- Emergency treatment is covered at any hospital (reimbursement basis for out-of-network).
        """.strip(),
    },

    # ─── ABSHER DIGITAL SERVICES ─────────────────────────────────────────────
    {
        "title": "Absher Digital Platform — Complete Guide to Services",
        "language": "en",
        "source_url": "https://www.absher.sa/portal/citizen/home.html",
        "content": """
Absher (absher.com.sa) is Saudi Arabia's primary e-government platform offering 200+ government services online.

KEY SERVICES AVAILABLE ON ABSHER:
1. IQAMA & RESIDENCY: View Iqama status, renew Iqama, check expiry, dependents management.
2. PASSPORTS: Renew Saudi passport, issue new passport, request emergency travel document.
3. TRAFFIC: View violations, pay fines, appeal fines, renew vehicle registration (Istimara), vehicle ownership transfer.
4. VISA SERVICES: Issue exit/re-entry visas for dependents, personal visit visas, sponsor management.
5. DOCUMENT AUTHENTICATION: Authenticate civil documents, marriage certificates, birth certificates.
6. APPOINTMENTS: Book government service appointments (MOI, MHRSD, etc.).
7. BUSINESS: Register a business, view company information, employee management.
8. FAMILY: Add/remove dependents, manage household members.

REGISTRATION:
- Visit absher.com.sa or download Absher app (iOS/Android).
- Register with National ID (Saudis) or Iqama number (expats).
- OTP sent to registered mobile number.

TAWAKKALNA APP:
- COVID-era app now expanded to: health certificates, vaccine status, permits.
- Integrated with Absher for identity verification.

MUQEEM:
- Specialized platform for employers to manage expat worker residency permits.
- Linked to Absher business accounts.

SAUDI PASSPORT (JAWAZAT): jawazat.gov.sa — for all passport and travel document services.
        """.strip(),
    },
    {
        "title": "بوابة أبشر — دليل شامل للخدمات الرقمية",
        "language": "ar",
        "source_url": "https://www.absher.sa/portal/citizen/home.html",
        "content": """
أبشر (absher.com.sa) هي البوابة الحكومية الإلكترونية الرئيسية في المملكة العربية السعودية وتقدم أكثر من 200 خدمة حكومية.

أبرز الخدمات المتاحة:
1. الإقامة: عرض حالة الإقامة، التجديد، إدارة التابعين.
2. جوازات السفر: تجديد جواز السفر، إصدار جوازات جديدة.
3. المرور: عرض المخالفات وسدادها، تجديد الاستمارة، نقل ملكية المركبات.
4. تأشيرات الخروج والعودة للتابعين.
5. المواعيد: حجز مواعيد الخدمات الحكومية.

التسجيل:
- زيارة absher.com.sa أو تنزيل تطبيق أبشر.
- يتم التسجيل برقم الهوية الوطنية (للمواطنين) أو رقم الإقامة (للمقيمين).
        """.strip(),
    },

    # ─── GOSI (SOCIAL INSURANCE) ─────────────────────────────────────────────
    {
        "title": "GOSI — General Organization for Social Insurance in Saudi Arabia",
        "language": "en",
        "source_url": "https://www.gosi.gov.sa/en",
        "content": """
GOSI (General Organization for Social Insurance) provides social insurance for all workers in Saudi Arabia.

CONTRIBUTION RATES:
For SAUDI EMPLOYEES:
- Employee contribution: 10% of salary.
- Employer contribution: 12% of salary (9% social insurance + 1.5% occupational hazard + 1.5% annuity).

For NON-SAUDI (EXPAT) EMPLOYEES:
- Employee contribution: 0%.
- Employer contribution: 2% (occupational hazard only).

BENEFITS FOR SAUDIS:
- Old-age pension: Available at age 60 (men) / 55 (women) with minimum 10 years of contributions.
- Disability benefit: If unable to work due to injury/illness.
- Death benefit: Paid to heirs of deceased insured worker.
- Unemployment benefit (SANED): Available for Saudi employees who are involuntarily terminated.

SANED (Unemployment Insurance):
- Saudi employees contribute 0.75% of salary; employer contributes 0.75%.
- Pays 60% of last salary for up to 3 months (extendable to 12 months in some cases).
- Claim via: gosi.gov.sa or Absher platform.

EMPLOYER OBLIGATIONS:
- Register all employees within 10 days of employment.
- Pay monthly contributions by the 15th of the following month.
- Non-compliance fines: SAR 5,000 per unregistered employee.

PORTAL: gosi.gov.sa | App: GOSI app on iOS/Android.
        """.strip(),
    },

    # ─── NATIONAL ADDRESS / SAUDI POST ───────────────────────────────────────
    {
        "title": "National Address (Saudi Post) — Registration and Importance",
        "language": "en",
        "source_url": "https://splonline.com.sa/en/national-address/",
        "content": """
The National Address is a mandatory unique address identifier assigned to every resident and business in Saudi Arabia.

WHY IT IS REQUIRED:
- Government services (MHRSD, ZATCA, MOI) require a registered National Address.
- Iqama renewal requires a valid National Address.
- Bank accounts, utility connections, and health insurance all need it.

HOW TO REGISTER:
1. Visit splonline.com.sa or use the Saudi Post app.
2. Create an account with National ID / Iqama.
3. Enter your physical location details (building number, street, district, city, postal code).
4. Confirm the address on the map.
5. You will receive your unique National Address code.

FORMAT: Building No. + Street Name + District + City + Postal Code + Additional Code.
Example: 1234 King Fahd Road, Al-Olaya, Riyadh 12346 – 3456

UPDATING ADDRESS: Update within 60 days of moving to avoid issues with government notifications and mail delivery.

BUSINESS NATIONAL ADDRESS: Required for CR, ZATCA registration, and receiving government correspondences.
        """.strip(),
    },

    # ─── KAFALA REFORM / MOBILITY ─────────────────────────────────────────────
    {
        "title": "Kafala System Reform — Worker Mobility and Freedom in Saudi Arabia",
        "language": "en",
        "source_url": "https://mhrsd.gov.sa/en/labor-reforms",
        "content": """
Saudi Arabia implemented major reforms to the Kafala (sponsorship) system in 2021 under Vision 2030.

KEY REFORMS:
1. CHANGE OF EMPLOYER WITHOUT KAFEEL CONSENT:
   - Expat workers who have completed 1 year with their employer can now transfer to a new employer without the sponsor's approval.
   - Submit the transfer request through Absher or MHRSD's Qiwa platform (qiwa.sa).

2. EXIT WITHOUT SPONSOR PERMISSION:
   - Workers no longer need employer permission to leave Saudi Arabia.
   - Exit Re-Entry visa can be issued independently through Absher.

3. FINAL EXIT VISA:
   - Workers can obtain a final exit visa without employer approval (after resolving any disputes).
   - No more exit ban imposed solely by employer.

WHO IS EXEMPT FROM THESE REFORMS:
- Domestic workers (maids, drivers, etc.) remain under modified kafala rules.
- Workers under active legal disputes may face temporary travel restrictions.

QIWA PLATFORM (qiwa.sa):
- Manage labor contracts, transfer requests, and workplace dispute complaints.
- Required for all private sector employers with 5+ employees.
- Saudization (Nitaqat) compliance tracked here.

NITAQAT (SAUDIZATION):
- System requiring companies to maintain a minimum percentage of Saudi employees.
- Minimum Saudization ratios vary by sector (e.g., 15% in construction, 90% in some retail).
- Platinum, Green, Yellow, Red status determines your access to government services.
        """.strip(),
    },

    # ─── ZAKAT ───────────────────────────────────────────────────────────────
    {
        "title": "Zakat Obligations for Saudi Companies — ZATCA Guidelines",
        "language": "en",
        "source_url": "https://zatca.gov.sa/en/zakat",
        "content": """
Zakat is an Islamic financial obligation applied to Saudi and GCC-owned businesses in Saudi Arabia.

WHO PAYS ZAKAT:
- Saudi-owned or GCC-national-owned businesses.
- Foreign-owned companies pay corporate income tax (20%) instead of Zakat.
- Mixed Saudi/foreign ownership: Zakat applies to the Saudi-owned portion; income tax on the foreign portion.

ZAKAT RATE: 2.5% of the Zakat base (approximately net assets adjusted per Sharia rules).

ZAKAT BASE CALCULATION (simplified):
Zakat Base = Capital + Profits + Long-term loans – Fixed assets – Long-term investments – Losses

FILING & DEADLINES:
- Annual filing due within 120 days after the end of the fiscal year.
- Companies with fiscal year ending December 31: Deadline is April 30.
- Filing through my.zatca.gov.sa.

EXEMPTIONS:
- Government entities.
- Charities and non-profit organizations.
- Agricultural income in some cases.

PENALTIES:
- Late filing: 1% of Zakat due per month (maximum 25%).
- Underpayment: 25% of difference.
- Evasion: Up to 100% of unpaid Zakat + criminal prosecution.

ZAKAT CERTIFICATE:
- Issued after paying Zakat.
- Required for: government contracts, bank financing, and various government service renewals.
        """.strip(),
    },

    # ─── HAJJ & UMRAH ────────────────────────────────────────────────────────
    {
        "title": "Hajj and Umrah — Regulations, Permits, and Procedures",
        "language": "en",
        "source_url": "https://www.haj.gov.sa/en",
        "content": """
The Ministry of Hajj and Umrah manages all pilgrimage-related services in Saudi Arabia.

UMRAH (Year-round pilgrimage):
- Foreign pilgrims: Apply through an approved Umrah package from an authorized tour operator in home country.
- Saudi residents: Can perform Umrah with valid Iqama without a separate visa.
- Umrah visa duration: Usually 30 days. Overstaying is a violation.

HAJJ:
- Annual pilgrimage during Dhul Hijjah (12th Islamic month).
- A quota system applies: roughly 1 per 1,000 Muslims per country.
- Applications submitted through national Hajj missions in each country.
- Saudis and GCC residents: Apply online via nusuk.sa (Nusuk platform).

NUSUK PLATFORM (nusuk.sa):
- Official one-stop platform for Hajj and Umrah permits.
- Book accommodation, transportation, and religious guides.
- Mandatory for all pilgrims performing Hajj.

HAJJ WITHOUT PERMIT:
- Strictly prohibited. Fines up to SAR 10,000 for pilgrims without official permits.
- All access points to Makkah are controlled during Hajj season.

MAKKAH ENTRY:
- Non-Muslims are not permitted to enter Makkah or Madinah.
- Checkpoints are maintained at all entry roads.

RELIGIOUS GUIDES (MUTAWWIF):
- Mutawwifeen are licensed guides. Mandatory for some pilgrimage groups.
- Licensed through the Ministry of Hajj.
        """.strip(),
    },

    # ─── EDUCATION ───────────────────────────────────────────────────────────
    {
        "title": "Education System in Saudi Arabia — School Enrollment and University Admission",
        "language": "en",
        "source_url": "https://moe.gov.sa/en",
        "content": """
Education in Saudi Arabia is managed by the Ministry of Education (MOE).

SCHOOL SYSTEM:
- Primary (Grade 1–6): Ages 6–12.
- Intermediate (Grade 7–9): Ages 12–15.
- Secondary (Grade 10–12): Ages 15–18.
- Academic year: September – June.

ENROLLMENT FOR EXPAT CHILDREN:
- Saudi government schools do not accept non-Saudis.
- Expat children must attend private international schools.
- Schools licensed by MOE include American, British, Indian (CBSE), IB, and others.
- Fees vary widely: SAR 10,000–100,000/year.

UNIVERSITY ADMISSIONS (Saudi Nationals):
- University admissions managed by the National Center for Assessment (Qiyas) and National Center for Academic Accreditation (NCAAA).
- Unified Admission System: Apply via edugate.moe.gov.sa.
- Admission based on: Secondary school GPA + Qiyas tests (aptitude + achievement).

SCHOLARSHIPS:
- King Abdullah Scholarship Program for Saudis to study abroad.
- Apply via: scholarship.gov.sa.

CREDENTIAL RECOGNITION:
- Foreign degrees must be attested through the Ministry of Education.
- Use the MOHESR credential evaluation portal.

DIGITAL EDUCATION:
- Noor system (noor.moe.gov.sa): Student grades, attendance, and school registration.
- Madrasati platform: Distance learning for school students.
        """.strip(),
    },

    # ─── REAL ESTATE ─────────────────────────────────────────────────────────
    {
        "title": "Real Estate Ownership and Registration in Saudi Arabia",
        "language": "en",
        "source_url": "https://www.rega.gov.sa/en",
        "content": """
Real estate in Saudi Arabia is regulated by the Real Estate General Authority (REGA).

WHO CAN OWN PROPERTY:
- Saudi nationals: Full ownership rights nationwide.
- GCC nationals: Can own property in most areas.
- Foreign nationals (non-GCC): Limited to specific areas; may own for residential purposes with restrictions. Cannot own in Makkah and Madinah.
- Foreign companies licensed in KSA: Can own property needed for business operations.

PROPERTY REGISTRATION:
- All property transactions must be registered through the Ministry of Justice (MOJ) online platform: moj.gov.sa.
- A Notary Public must witness and record the transaction.

PROPERTY TRANSFER FEES:
- Real Estate Transaction Tax (RETT): 5% of the property value, paid by the buyer.
- Exemptions: First-time home buyers (one property up to SAR 1 million).

MORTGAGE (HOUSING LOANS):
- Available through Saudi banks and Real Estate Development Fund (REDF) for Saudi nationals.
- REDF offers interest-free loans up to SAR 500,000 for eligible Saudis.
- Commercial banks: Up to 90% financing for first home.

RENTAL DISPUTES:
- Ejar platform (ejar.sa): Mandatory registration of all rental contracts.
- Disputes handled by the Rental Dispute Settlement Committees.

AYDINLI PLATFORM: For mapping, property boundaries, and urban planning data.
        """.strip(),
    },

    # ─── CUSTOMS ─────────────────────────────────────────────────────────────
    {
        "title": "Customs Regulations — Import, Export, and Duty Exemptions in Saudi Arabia",
        "language": "en",
        "source_url": "https://zatca.gov.sa/en/customs",
        "content": """
Customs in Saudi Arabia is managed by the Zakat, Tax and Customs Authority (ZATCA).

IMPORT DUTY RATES:
- General goods: 5% of CIF (Cost + Insurance + Freight) value.
- Tobacco products: 100%.
- Soft drinks/energy drinks: 50%.
- Some food items: 0% (staples).
- Luxury cars: 15%.
- GCC goods: 0% (free trade within GCC).

PROHIBITED IMPORTS:
- Alcohol and pork products (strictly prohibited).
- Drugs and narcotics.
- Weapons and ammunition (without special license).
- Pornographic material.
- Items infringing intellectual property rights.

PERSONAL ALLOWANCES (Returning Travelers):
- Cash: Up to SAR 60,000 without declaration. Above must be declared.
- Personal items: Duty-free if not for commercial purposes.
- Gifts: Up to SAR 3,000 value duty-free.

E-COMMERCE IMPORTS:
- Packages under SAR 1,000: Exempt from customs duty.
- Above SAR 1,000: Subject to standard import duties.

CUSTOMS CLEARANCE:
- Submit import declaration via FASAH portal (fasah.sa).
- Required documents: Invoice, packing list, certificate of origin, HS code.

EXPORT REGULATIONS:
- Most goods can be exported freely.
- Antiques, archaeological items: Prohibited without MOC permission.
- Strategic goods/dual-use items: Require special license.
        """.strip(),
    },

    # ─── PREMIUM RESIDENCY ───────────────────────────────────────────────────
    {
        "title": "Saudi Premium Residency — Types, Benefits, and How to Apply",
        "language": "en",
        "source_url": "https://premium.moi.gov.sa/en",
        "content": """
The Saudi Premium Residency (Iqama Mumayyaza) allows eligible foreigners to live and work in Saudi Arabia freely, similar to a permanent residency card.

TYPES:
1. Permanent Premium Residency: One-time fee of SAR 800,000. Lifetime residency for holder and family.
2. Temporary Premium Residency: Annual fee of SAR 100,000/year. Can be converted to permanent.

BENEFITS:
- No Saudi sponsor required (no kafeel).
- Right to own residential property.
- Can work for any employer or run own business.
- Family members included (spouse + children).
- Access to all government services equivalent to Saudis (health, education, etc.).
- Can sponsor domestic workers.

ELIGIBILITY REQUIREMENTS:
- Clean criminal record (in Saudi Arabia and home country).
- Valid passport (at least 2 years remaining).
- Financial solvency: Must demonstrate ability to financially support self and family.
- Profession: Preference for highly skilled professionals, investors, and talent in priority sectors.
- Medical fitness certificate.

HOW TO APPLY:
1. Visit premium.moi.gov.sa.
2. Create an account and fill out the application form.
3. Upload required documents.
4. Pay the application fee (SAR 2,000 non-refundable).
5. Wait for review (typically 60–90 days).
6. If approved, pay the residency fee and receive the Iqama Mumayyaza card.

PROCESSING TIME: 60–90 days.
VALIDITY: Permanent (no renewal) or annual (renewable).
        """.strip(),
    },
]


def main():
    client = get_supabase_admin_client()
    print(f"Starting ingestion of {len(POLICIES)} Saudi government policy documents...\n")
    total_chunks = 0

    for policy in POLICIES:
        print(f"  → [{policy['language'].upper()}] {policy['title']}")
        chunks = ingest_policy_document(
            title=policy["title"],
            content=policy["content"],
            language=policy["language"],
            source_url=policy["source_url"],
            client=client,
        )
        total_chunks += chunks
        print(f"       ✓ {chunks} chunk(s) ingested")

    print(f"\n✅ Done! Ingested {len(POLICIES)} documents across {total_chunks} total chunks.\n")
    print("Your GovAssist AI knowledge base is now loaded with real Saudi government policies.")
    print("Topics covered: Iqama, Business Registration, VAT, Labor Law, Traffic,")
    print("Driving License, Health Insurance, Absher, GOSI, National Address,")
    print("Kafala Reform, Zakat, Hajj & Umrah, Education, Real Estate, Customs, Premium Residency")


if __name__ == "__main__":
    main()
