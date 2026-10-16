'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguageStore } from '@/stores/useLanguageStore';

interface SubCategoryItem {
  id: string;
  name: string;
  nameAr: string;
  image: string;
  query: string;
}

interface MainTabItem {
  id: string;
  slug: string;
  label: string;
  labelAr: string;
  subcategories: SubCategoryItem[];
}

export const FRIDAYPARTS_TABS: MainTabItem[] = [
  {
    id: 'engine-spare-parts',
    slug: 'engine-spare-parts',
    label: 'Engine Spare Parts',
    labelAr: 'قطع غيار المحركات',
    subcategories: [
      { id: 'esp-1', name: 'Injectors & Nozzle', nameAr: 'بخاخات وفوهات الديزل', image: '/images/categories/injectors-nozzle.png', query: 'Injector' },
      { id: 'esp-2', name: 'Injection Pump', nameAr: 'طلمبة حقن الوقود', image: '/images/categories/injection-pump.jpg', query: 'Injection Pump' },
      { id: 'esp-3', name: 'Fuel Pump', nameAr: 'مضخة الوقود', image: '/images/categories/fuel-pump.png', query: 'Fuel Pump' },
      { id: 'esp-4', name: 'Crankshaft', nameAr: 'عمود الكرنك', image: '/images/categories/crankshaft.jpg', query: 'Crankshaft' },
      { id: 'esp-5', name: 'Cylinder Head', nameAr: 'رأس السلندر', image: '/images/categories/cylinder-head.png', query: 'Cylinder Head' },
      { id: 'esp-6', name: 'Overhaul Kits', nameAr: 'طقم عمرة كامل', image: '/images/categories/overhaul-kits.jpg', query: 'Overhaul Kit' },
      { id: 'esp-7', name: 'Overhaul Gasket', nameAr: 'طقم كاسكيت وجوانات', image: '/images/categories/overhaul-gasket.jpg', query: 'Gasket' },
      { id: 'esp-8', name: 'Starter Motor', nameAr: 'سلف تشغيل المحرك', image: '/images/categories/starter-motor.jpg', query: 'Starter' },
      { id: 'esp-9', name: 'Alternator', nameAr: 'دينمو الشحن', image: '/images/categories/alternator.jpg', query: 'Alternator' },
      { id: 'esp-10', name: 'Glow Plug', nameAr: 'دفايات وبواجي تسخين', image: '/images/categories/glow-plug.jpg', query: 'Glow Plug' },
      { id: 'esp-11', name: 'Stop Solenoid', nameAr: 'سولينويد إطفاء المحرك', image: '/images/categories/stop-solenoid.jpg', query: 'Stop Solenoid' },
      { id: 'esp-12', name: 'Turbocharger & Kit', nameAr: 'شواحن التيربو', image: '/images/categories/turbocharger-kit.png', query: 'Turbocharger' },
      { id: 'esp-13', name: 'Manifold', nameAr: 'منفولد سحب وعادم', image: '/images/categories/manifold.png', query: 'Manifold' },
      { id: 'esp-14', name: 'Muffler', nameAr: 'كنداسة وشكمان', image: '/images/categories/muffler.jpg', query: 'Muffler' },
      { id: 'esp-15', name: 'Oil Pump', nameAr: 'طلمبة زيت المحرك', image: '/images/categories/oil-pump.jpg', query: 'Oil Pump' },
      { id: 'esp-16', name: 'Water Pump', nameAr: 'طلمبة ماء التبريد', image: '/images/categories/water-pump.jpg', query: 'Water Pump' },
      { id: 'esp-17', name: 'Thermostat', nameAr: 'ثرموستات الحرارة', image: '/images/categories/thermostat.jpg', query: 'Thermostat' },
      { id: 'esp-18', name: 'Belts', nameAr: 'سيور وقواشيط المحرك', image: '/images/categories/belts.jpg', query: 'Belt' },
    ],
  },
  {
    id: 'electrical-parts',
    slug: 'electrical-parts',
    label: 'Electrical Parts',
    labelAr: 'القطع الكهربائية',
    subcategories: [
      { id: 'elec-1', name: 'Controllers & Monitors', nameAr: 'كمبيوترات وشاشات التحكم', image: '/images/categories/controllers-monitors.jpg', query: 'Controller' },
      { id: 'elec-2', name: 'Monitor Display Panel', nameAr: 'شاشات كابينة العرض', image: '/images/categories/monitor-display-panel.png', query: 'Monitor' },
      { id: 'elec-3', name: 'Control Box', nameAr: 'صناديق التحكم الكهربائي', image: '/images/categories/control-box.jpg', query: 'Control Box' },
      { id: 'elec-4', name: 'Solenoid Valve', nameAr: 'صمامات سولينويد كهربائية', image: '/images/categories/solenoid-valve.png', query: 'Solenoid Valve' },
      { id: 'elec-5', name: 'Solenoid Valve Coil', nameAr: 'ملفات وبوبينات سولينويد', image: '/images/categories/solenoid-valve-coil.jpg', query: 'Coil' },
      { id: 'elec-6', name: 'Speed Governor Actuator', nameAr: 'محركات ومنظمات السرعة', image: '/images/categories/speed-governor-actuator.png', query: 'Actuator' },
      { id: 'elec-7', name: 'Sensors', nameAr: 'حساسات المحرك والهيدروليك', image: '/images/categories/sensors.jpg', query: 'Sensor' },
      { id: 'elec-8', name: 'Gauge & Meter', nameAr: 'ساعات وعدادات القياس', image: '/images/categories/gauge-meter-indicator.jpg', query: 'Gauge' },
      { id: 'elec-9', name: 'Lamps', nameAr: 'كشافات وإنارة المعدات', image: '/images/categories/lamps.jpg', query: 'Lamp' },
      { id: 'elec-10', name: 'Switch', nameAr: 'مفاتيح وسويتشات', image: '/images/categories/switch.jpg', query: 'Switch' },
      { id: 'elec-11', name: 'Ignition Switch', nameAr: 'سويتش وكونتاكت التشغيل', image: '/images/categories/ignition-switch.jpg', query: 'Ignition' },
      { id: 'elec-12', name: 'PTO Switch', nameAr: 'سويتش تعشيق PTO', image: '/images/categories/pto-switch.jpg', query: 'PTO' },
      { id: 'elec-13', name: 'Pressure Switch', nameAr: 'سويتشات وحساسات الضغط', image: '/images/categories/pressure-switch.jpg', query: 'Pressure Switch' },
      { id: 'elec-14', name: 'Battery Charger', nameAr: 'شواحن بطاريات الخدمة الشاقة', image: '/images/categories/battery-charger.jpg', query: 'Battery Charger' },
      { id: 'elec-15', name: 'Regulator', nameAr: 'منظمات الجهد والكهرباء', image: '/images/categories/regulator.png', query: 'Regulator' },
      { id: 'elec-16', name: 'Relay & Fuse', nameAr: 'كتاوت وفيوزات كهربائية', image: '/images/categories/relay-contactor-fuse.jpg', query: 'Relay' },
      { id: 'elec-17', name: 'Wiring Harness', nameAr: 'ضفائر وأسلاك كهربائية', image: '/images/categories/wiring-harness.png', query: 'Harness' },
      { id: 'elec-18', name: 'Cable', nameAr: 'كابلات وتوصيلات البطارية', image: '/images/categories/cable.jpg', query: 'Cable' },
    ],
  },
  {
    id: 'hydraulic-pneumatic-parts',
    slug: 'hydraulic-pneumatic-parts',
    label: 'Hydraulic & Pneumatic Parts',
    labelAr: 'قطع الهيدروليك وضغط الهواء',
    subcategories: [
      { id: 'hyd-1', name: 'Hydraulic Motor', nameAr: 'مواتير هيدروليك', image: '/images/categories/hydraulic-motor.jpg', query: 'Hydraulic Motor' },
      { id: 'hyd-2', name: 'Hydraulic Pump', nameAr: 'مضخات هيدروليك رئيسية', image: '/images/categories/hydraulic-pump.jpg', query: 'Hydraulic Pump' },
      { id: 'hyd-3', name: 'Hydraulic Pump Parts', nameAr: 'قطع غيار طلمبات الهيدروليك', image: '/images/categories/hydraulic-pump-parts.jpg', query: 'Pump Parts' },
      { id: 'hyd-4', name: 'Gear Pump', nameAr: 'مضخات تروس هيدروليكية', image: '/images/categories/gear-pump.jpg', query: 'Gear Pump' },
      { id: 'hyd-5', name: 'Main & Relief Valve', nameAr: 'بلوف وصمامات أمان رئيسية', image: '/images/categories/main-relief-valve.png', query: 'Relief Valve' },
      { id: 'hyd-6', name: 'Joystick Pilot Valve', nameAr: 'صمامات جويستيك بايلوت', image: '/images/categories/joystick-pilot-valve.png', query: 'Pilot Valve' },
      { id: 'hyd-7', name: 'Control Valve', nameAr: 'صمامات التحكم الهيدروليكي', image: '/images/categories/control-valve.jpg', query: 'Control Valve' },
      { id: 'hyd-8', name: 'Regulator Valve', nameAr: 'بلوف تنظيم التدفق والضغط', image: '/images/categories/regulator-valve.jpg', query: 'Regulator Valve' },
      { id: 'hyd-9', name: 'Hydraulic Cylinder', nameAr: 'بساتم واسطوانات هيدروليك', image: '/images/categories/hydraulic-cylinder.jpg', query: 'Cylinder' },
      { id: 'hyd-10', name: 'Bushing', nameAr: 'جلب وبنزات الهيدروليك', image: '/images/categories/bushing.jpg', query: 'Bushing' },
      { id: 'hyd-11', name: 'Lift Arm Tach Kit', nameAr: 'أطقم وصلات وأذرع الرفع', image: '/images/categories/lift-arm-tach-kit.jpg', query: 'Lift Arm' },
      { id: 'hyd-12', name: 'Swivel Joint', nameAr: 'وصلات دوارة سنتر جوينت', image: '/images/categories/swivel-joint.jpg', query: 'Swivel Joint' },
      { id: 'hyd-13', name: 'Hydraulic Coupler', nameAr: 'كوبلنج وقواطع سريعة', image: '/images/categories/hydraulic-coupler.png', query: 'Coupler' },
      { id: 'hyd-14', name: 'Coupling', nameAr: 'كوبلنج مرن بين المحرك والطلمبة', image: '/images/categories/coupling.png', query: 'Coupling' },
      { id: 'hyd-15', name: 'Hydraulic Hose', nameAr: 'خراطيم هيدروليك ضغط عالي', image: '/images/categories/hydraulic-hose.jpg', query: 'Hose' },
      { id: 'hyd-16', name: 'Brake Air Compressor', nameAr: 'كمبروسرات هواء الفرامل', image: '/images/categories/brake-air-compressor.jpg', query: 'Air Compressor' },
      { id: 'hyd-17', name: 'Pressure Regulator', nameAr: 'منظمات ضغط الهواء والزيت', image: '/images/categories/pressure-regulator.jpg', query: 'Pressure Regulator' },
      { id: 'hyd-18', name: 'Drain Parts', nameAr: 'محابس وتصريف الهيدروليك', image: '/images/categories/drain-parts.jpg', query: 'Drain' },
    ],
  },
  {
    id: 'transmission-undercarriage-parts',
    slug: 'transmission-undercarriage-parts',
    label: 'Transmission & Undercarriage Parts',
    labelAr: 'قطع الحركة والجنازير',
    subcategories: [
      { id: 'trans-1', name: 'Travel Motor & Gearbox', nameAr: 'مواتير سير وجيربوكسات حركة', image: '/images/categories/travel-motor-gearbox.jpg', query: 'Travel Motor' },
      { id: 'trans-2', name: 'Swing Motor & Gearbox', nameAr: 'مواتير دوران وجيربوكسات صينية', image: '/images/categories/swing-motor-gearbox.jpg', query: 'Swing Motor' },
      { id: 'trans-3', name: 'Track Roller', nameAr: 'بكرات جنزير سفلية', image: '/images/categories/track-roller.jpg', query: 'Track Roller' },
      { id: 'trans-4', name: 'Carrier Roller', nameAr: 'بكرات جنزير علوية حاملة', image: '/images/categories/carrier-roller.jpg', query: 'Carrier Roller' },
      { id: 'trans-5', name: 'Idler', nameAr: 'عجلات شد أمامية (آيدلر)', image: '/images/categories/idler.png', query: 'Idler' },
      { id: 'trans-6', name: 'Sprocket', nameAr: 'تروس جنزير مسننة (سبوركت)', image: '/images/categories/sprocket.jpg', query: 'Sprocket' },
      { id: 'trans-7', name: 'Lowering & Leveling Kits', nameAr: 'أطقم رفع وتسوية الجنازير', image: '/images/categories/lowering-leveling-lifting-kits.jpg', query: 'Leveling Kit' },
      { id: 'trans-8', name: 'Ball Joint', nameAr: 'بيض ومفاصل كروية', image: '/images/categories/ball-joint.jpg', query: 'Ball Joint' },
      { id: 'trans-9', name: 'Clutch Parts', nameAr: 'كلاتشات ودبرياج المعدات', image: '/images/categories/clutch-parts.jpg', query: 'Clutch' },
      { id: 'trans-10', name: 'Torque Converter', nameAr: 'محولات عزم هيدروليكية', image: '/images/categories/torque-converter.jpg', query: 'Torque Converter' },
      { id: 'trans-11', name: 'Transmission Pump', nameAr: 'طلمبات جيربوكس وناقل حركة', image: '/images/categories/transmission-pump.jpg', query: 'Transmission Pump' },
      { id: 'trans-12', name: 'Differential', nameAr: 'كورونات وتروس تفاضلية', image: '/images/categories/differential.jpg', query: 'Differential' },
      { id: 'trans-13', name: 'Tensioner Idler', nameAr: 'شدادات وبكرات سير وتوجيه', image: '/images/categories/tensioner-idler.jpg', query: 'Tensioner' },
      { id: 'trans-14', name: 'Bearing, Gear & Shaft', nameAr: 'رولمان بلي وتروس وأعمدة نقل', image: '/images/categories/bearing-gear-shaft.jpg', query: 'Bearing' },
      { id: 'trans-15', name: 'PTO Shaft', nameAr: 'أعمدة نقل الحركة PTO', image: '/images/categories/pto-shaft.png', query: 'PTO Shaft' },
      { id: 'trans-16', name: 'Tie Rod', nameAr: 'أذرع وتياش دركسيون وتوجيه', image: '/images/categories/tie-rod.jpg', query: 'Tie Rod' },
      { id: 'trans-17', name: 'Steering Pump', nameAr: 'طلمبات دركسيون وتوجيه', image: '/images/categories/steering-pump.jpg', query: 'Steering Pump' },
      { id: 'trans-18', name: 'Brake Discs & Calipers', nameAr: 'أقراص فرامل وتيل وكليبرات', image: '/images/categories/brake-discs-pads-calipers.jpg', query: 'Brake' },
    ],
  },
  {
    id: 'seals-filters-maintenance-parts',
    slug: 'seals-filters-maintenance-parts',
    label: 'Seals, Filters & Maintenance Parts',
    labelAr: 'السيلات والفلاتر والصيانة',
    subcategories: [
      { id: 'seal-1', name: 'Arm Cylinder Seal Kit', nameAr: 'طقم سيلات بستم الذراع', image: '/images/categories/arm-cylinder-seal-kit.jpg', query: 'Arm Seal' },
      { id: 'seal-2', name: 'Boom Cylinder Seal Kit', nameAr: 'طقم سيلات بستم البوم', image: '/images/categories/boom-cylinder-seal-kit.jpg', query: 'Boom Seal' },
      { id: 'seal-3', name: 'Bucket Cylinder Seal Kit', nameAr: 'طقم سيلات بستم الباكت', image: '/images/categories/bucket-cylinder-seal-kit.jpg', query: 'Bucket Seal' },
      { id: 'seal-4', name: 'Swing Joint Seal Kit', nameAr: 'طقم سيلات سنتر جوينت دوار', image: '/images/categories/swing-joint-seal-kit.jpg', query: 'Swing Seal' },
      { id: 'seal-5', name: 'Cylinder Seal Kit', nameAr: 'أطقم سيلات بساتم هيدروليكية', image: '/images/categories/hydraulic-cylinder-seal-kit.png', query: 'Cylinder Seal' },
      { id: 'seal-6', name: 'Diesel Fuel Filter', nameAr: 'فلاتر ديزل ووقود محركات', image: '/images/categories/diesel-fuel-filter.jpg', query: 'Fuel Filter' },
      { id: 'seal-7', name: 'Engine Oil Filter', nameAr: 'فلاتر زيت المحرك الشاق', image: '/images/categories/oil-filter.png', query: 'Oil Filter' },
      { id: 'seal-8', name: 'Engine Air Filter', nameAr: 'فلاتر هواء وتنقية السحب', image: '/images/categories/air-filter.png', query: 'Air Filter' },
      { id: 'seal-9', name: 'Hydraulic Oil Filter', nameAr: 'فلاتر زيت هيدروليك دقيقة', image: '/images/categories/hydraulic-filter.png', query: 'Hydraulic Filter' },
      { id: 'seal-10', name: 'Water Separator', nameAr: 'فلاتر وفواصل ماء عن الديزل', image: '/images/categories/water-separator.jpg', query: 'Water Separator' },
      { id: 'seal-11', name: 'Air Cleaner', nameAr: 'مجمعات فلاتر هواء المحرك', image: '/images/categories/air-cleaner.jpg', query: 'Air Cleaner' },
      { id: 'seal-12', name: 'Filter Kit', nameAr: 'طقم صيانة وفلاتر كاملة', image: '/images/categories/filter-kit.png', query: 'Filter Kit' },
      { id: 'seal-13', name: 'Service Tank', nameAr: 'خزانات ومستودعات سوائل', image: '/images/categories/service-tank.jpg', query: 'Tank' },
      { id: 'seal-14', name: 'Radiator & Oil Caps', nameAr: 'أغطية رادياتير وخزانات زيت', image: '/images/categories/radiator-oil-fuel-caps.jpg', query: 'Cap' },
      { id: 'seal-15', name: 'Dust Cover', nameAr: 'أغطية وجلود حماية من الغبار', image: '/images/categories/dust-cover.jpg', query: 'Dust Cover' },
      { id: 'seal-16', name: 'Hose', nameAr: 'خراطيم مياه وتبريد زيت', image: '/images/categories/hose.jpg', query: 'Hose' },
      { id: 'seal-17', name: 'Tube and Pipe', nameAr: 'مواسير وأنابيب معدنية صلبة', image: '/images/categories/tube-and-pipe.jpg', query: 'Pipe' },
      { id: 'seal-18', name: 'O-Ring Box', nameAr: 'شنطة أورينجات صيانة شاملة', image: '/images/categories/o-ring-box.jpg', query: 'O-Ring' },
    ],
  },
  {
    id: 'cab-body-parts',
    slug: 'cab-body-parts',
    label: 'Cab & Body Parts',
    labelAr: 'قطع الكابينة والهيكل',
    subcategories: [
      { id: 'cab-1', name: 'Joystick Controller', nameAr: 'مقابض وجويستيك التحكم', image: '/images/categories/joystick-controller.png', query: 'Joystick' },
      { id: 'cab-2', name: 'Travel Control Knob', nameAr: 'أوكر ومقابض تحكم السير', image: '/images/categories/travel-control-knob.jpg', query: 'Knob' },
      { id: 'cab-3', name: 'Foot Valve & Pedal', nameAr: 'دواسات وبلوف قدم كابينة', image: '/images/categories/foot-valve-pedal-floor-mat.jpg', query: 'Pedal' },
      { id: 'cab-4', name: 'Lock', nameAr: 'أقفال وكوالين أبواب وكبوت', image: '/images/categories/lock.jpg', query: 'Lock' },
      { id: 'cab-5', name: 'Keys', nameAr: 'مفاتيح تشغيل ماكينات أصلية', image: '/images/categories/keys.png', query: 'Key' },
      { id: 'cab-6', name: 'Cab Assembly', nameAr: 'كابينات ومقصورات قيادة كاملة', image: '/images/categories/cab-assembly.jpg', query: 'Cab' },
      { id: 'cab-7', name: 'Gas Spring', nameAr: 'مساعدات وسوست غاز للكبوت', image: '/images/categories/gas-spring.jpg', query: 'Gas Spring' },
      { id: 'cab-8', name: 'Soft Top', nameAr: 'مظلات وأسقف واقية للكابينة', image: '/images/categories/soft-top.jpg', query: 'Canopy' },
      { id: 'cab-9', name: 'Weatherstrip', nameAr: 'كوتشات وسيلات عزل الأبواب', image: '/images/categories/weatherstrip.jpg', query: 'Weatherstrip' },
      { id: 'cab-10', name: 'Other Cab Parts', nameAr: 'إكسسوارات ومحتويات الكابينة', image: '/images/categories/other-cab-parts.jpg', query: 'Cab' },
      { id: 'cab-11', name: 'Wiper Arm & Blade', nameAr: 'مساحات وأذرع زجاج الكابينة', image: '/images/categories/wiper-arm-blade.jpg', query: 'Wiper' },
      { id: 'cab-12', name: 'Power Window Motor', nameAr: 'مواتير زجاج كهربائية', image: '/images/categories/power-window-motor.png', query: 'Window Motor' },
      { id: 'cab-13', name: 'Mirror', nameAr: 'مرايا جانبية وكابينة عريضة', image: '/images/categories/mirror.jpg', query: 'Mirror' },
      { id: 'cab-14', name: 'Decal', nameAr: 'استيكرات وعلامات تحذيرية', image: '/images/categories/decal.jpg', query: 'Decal' },
      { id: 'cab-15', name: 'Glass & Accessories', nameAr: 'زجاج أمامي وأبواب كابينة', image: '/images/categories/glass-accessories.jpg', query: 'Glass' },
      { id: 'cab-16', name: 'Door Handle', nameAr: 'مقابض وأيدي فتح الأبواب', image: '/images/categories/door-handle.jpg', query: 'Door Handle' },
      { id: 'cab-17', name: 'Propeller', nameAr: 'ريش ومراوح دفع وسحب', image: '/images/categories/propeller.jpg', query: 'Propeller' },
      { id: 'cab-18', name: 'Other Body Parts', nameAr: 'صاج وألواح حماية الشاسيه', image: '/images/categories/other-body-parts.jpg', query: 'Body' },
    ],
  },
  {
    id: 'hvac-parts',
    slug: 'hvac-parts',
    label: 'HVAC Parts',
    labelAr: 'التكييف والتبريد (HVAC)',
    subcategories: [
      { id: 'hvac-1', name: 'Engine Block Heater', nameAr: 'سخانات بلوك المحرك للبرد', image: '/images/categories/engine-block-heater.jpg', query: 'Block Heater' },
      { id: 'hvac-2', name: 'Air Heater', nameAr: 'دفيات وسخانات هواء كابينة', image: '/images/categories/air-heater.jpg', query: 'Air Heater' },
      { id: 'hvac-3', name: 'Heater Core', nameAr: 'سربنتينة ورادياتير سخان كابينة', image: '/images/categories/heater-core.jpg', query: 'Heater Core' },
      { id: 'hvac-4', name: 'Blower Motor', nameAr: 'مواتير بلاور وتوزيع هواء التكييف', image: '/images/categories/blower-motor.jpg', query: 'Blower Motor' },
      { id: 'hvac-5', name: 'A/C Compressor', nameAr: 'كمبروسرات تكييف كابينة المعدة', image: '/images/categories/ac-compressor.png', query: 'Compressor' },
      { id: 'hvac-6', name: 'A/C Receiver Drier', nameAr: 'فلتر ودراير رطوبة دورة التكييف', image: '/images/categories/ac-receiver-drier.jpg', query: 'Receiver Drier' },
      { id: 'hvac-7', name: 'A/C Condenser', nameAr: 'مكثف وسربنتينة تكييف خارجية', image: '/images/categories/ac-condenser.jpg', query: 'Condenser' },
      { id: 'hvac-8', name: 'A/C Expansion Valve', nameAr: 'بلف تمدد وتبريد فريون', image: '/images/categories/ac-expansion-valve.jpg', query: 'Expansion Valve' },
      { id: 'hvac-9', name: 'A/C Evaporator', nameAr: 'ثلاجة وسربنتينة تكييف داخلية', image: '/images/categories/ac-evaporator.png', query: 'Evaporator' },
      { id: 'hvac-10', name: 'Other A/C Parts', nameAr: 'خراطيم وتوصيلات دورة الفريون', image: '/images/categories/other-ac-parts.jpg', query: 'AC Parts' },
      { id: 'hvac-11', name: 'Water Tank Radiator', nameAr: 'رادياتيرات تبريد ماء المحرك', image: '/images/categories/water-tank-radiator.png', query: 'Radiator' },
      { id: 'hvac-12', name: 'Hydraulic Oil Cooler', nameAr: 'مبردات زيت هيدروليك ألمنيوم', image: '/images/categories/hydraulic-oil-cooler.jpg', query: 'Oil Cooler' },
      { id: 'hvac-13', name: 'Intercooler', nameAr: 'مبردات هواء التيربو إنتركولر', image: '/images/categories/intercooler.png', query: 'Intercooler' },
      { id: 'hvac-14', name: 'Aftercooler', nameAr: 'مبردات لاحقة للهواء المضغوط', image: '/images/categories/aftercooler.png', query: 'Aftercooler' },
      { id: 'hvac-15', name: 'Cooling Fan', nameAr: 'مراوح تبريد رادياتير المحرك', image: '/images/categories/fan.jpg', query: 'Fan' },
      { id: 'hvac-16', name: 'Fan Mount', nameAr: 'قواعد وطنابير تثبيت المراوح', image: '/images/categories/fan-mount.jpg', query: 'Fan Mount' },
      { id: 'hvac-17', name: 'Vibrasorber Suction', nameAr: 'وصلات امتصاص الاهتزاز والضغط', image: '/images/categories/vibrasorber-suction.png', query: 'Vibration' },
      { id: 'hvac-18', name: 'HVAC Controls', nameAr: 'لوحات ومفاتيح ضبط التكييف', image: '/images/categories/hvac.jpg', query: 'HVAC' },
    ],
  },
];

export function CategoryTabsSection() {
  const [activeTabId, setActiveTabId] = useState<string>('engine-spare-parts');
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const { lang, dir } = useLanguageStore();
  const isAr = lang === 'ar';

  const activeTab =
    FRIDAYPARTS_TABS.find((tab) => tab.id === activeTabId) || FRIDAYPARTS_TABS[0];

  const handleScrollRight = () => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: dir === 'rtl' ? -240 : 240, behavior: 'smooth' });
    }
  };

  const handleScrollLeft = () => {
    if (tabsScrollRef.current) {
      tabsScrollRef.current.scrollBy({ left: dir === 'rtl' ? 240 : -240, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-12 sm:py-16 bg-[#f5f6f8]" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 1. Centered Bold Title (§ FridayParts Standard) */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            {isAr ? 'ابحث عن قطع الغيار حسب القسم' : 'Find Parts by Category'}
          </h2>
        </div>

        {/* 2. Main Category Tabs: Continuous horizontal white bar with vertical dividers */}
        <div className="relative mb-8 bg-white border border-gray-200 shadow-xs flex items-center rounded-none sm:rounded-sm">
          {/* Scrollable Tabs Container */}
          <div
            ref={tabsScrollRef}
            className="flex-1 flex items-stretch overflow-x-auto scrollbar-none divide-x divide-gray-200 rtl:divide-x-reverse"
          >
            {FRIDAYPARTS_TABS.map((tab) => {
              const isActive = tab.id === activeTabId;
              const tabLabel = isAr ? tab.labelAr : tab.label;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabId(tab.id)}
                  type="button"
                  className={`relative shrink-0 px-5 sm:px-6 py-4 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none whitespace-nowrap flex items-center justify-center ${
                    isActive
                      ? 'text-blue-600 border-b-[3px] border-blue-600 bg-white'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50/70 border-b-[3px] border-transparent'
                  }`}
                >
                  <span>{tabLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Right Scroll Arrow Button (FridayParts style) */}
          <div className="shrink-0 flex items-center border-l border-gray-200 rtl:border-l-0 rtl:border-r bg-white h-full px-1.5">
            <button
              onClick={handleScrollRight}
              type="button"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 rounded-sm transition-colors cursor-pointer"
              aria-label="Scroll tabs"
            >
              <ChevronRight className={`w-5 h-5 ${dir === 'rtl' ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* 3. Subcategories Grid: 6 columns × 3 rows = 18 items */}
        {/* Pure white square cards for images only + Name text below */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 sm:gap-5">
          {activeTab.subcategories.map((sub) => {
            const subName = isAr ? sub.nameAr : sub.name;

            return (
              <Link
                key={sub.id}
                href={`/products?categorySlug=${activeTab.slug}&search=${encodeURIComponent(sub.query)}`}
                className="group flex flex-col items-center"
              >
                {/* Pure White Square Card for Image Only */}
                <div className="w-full aspect-square bg-white rounded-none sm:rounded-sm border border-gray-100 shadow-xs group-hover:shadow-md group-hover:border-blue-400 transition-all duration-200 p-4 flex items-center justify-center overflow-hidden">
                  <div className="relative w-full h-full">
                    <Image
                      src={sub.image}
                      alt={subName}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 15vw"
                      className="object-contain transform group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                </div>

                {/* Subcategory Name Outside & Under the White Card */}
                <span className="text-center font-semibold text-gray-800 text-xs sm:text-sm mt-2.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {subName}
                </span>
              </Link>
            );
          })}
        </div>

        {/* 4. Bottom View All Button: Pill shaped with blue border & blue text */}
        <div className="mt-10 flex justify-center">
          <Link
            href={`/products?categorySlug=${activeTab.slug}`}
            className="rounded-full border border-blue-600 text-blue-600 px-14 sm:px-16 py-2.5 font-medium text-sm hover:bg-blue-50 transition shadow-xs hover:shadow-sm"
          >
            {isAr ? 'عرض الكل' : 'View All'}
          </Link>
        </div>
      </div>
    </section>
  );
}
