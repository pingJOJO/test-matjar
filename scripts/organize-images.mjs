import fs from 'fs';
import path from 'path';

const SRC_BASE = 'E:/atoz/Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts';
const DEST_CATEGORIES = 'E:/atoz/frontend/public/images/categories';
const DEST_PRODUCTS = 'E:/atoz/frontend/public/images/products';

// Ensure destination directories exist
fs.mkdirSync(DEST_CATEGORIES, { recursive: true });
fs.mkdirSync(DEST_PRODUCTS, { recursive: true });

const mappings = [
  // 1. Engine Spare Parts
  {
    srcDir: 'Engine Spare Parts',
    items: [
      { file: 'imgi_13_fuel-injectors-and-injector-nozzles.png', name: 'injectors-nozzle.png', prodName: 'fuel-injector.png' },
      { file: 'imgi_14_5-Injection-Pump.jpg', name: 'injection-pump.jpg', prodName: 'fuel-injection-pump.jpg' },
      { file: 'imgi_15_aftermarket-fuel-pump.png', name: 'fuel-pump.png', prodName: 'electric-fuel-pump.png' },
      { file: 'imgi_16_18-Crankshaft.jpg', name: 'crankshaft.jpg', prodName: 'engine-crankshaft.jpg' },
      { file: 'imgi_17_Fridayparts-cylinder-head.png', name: 'cylinder-head.png', prodName: 'bare-cylinder-head.png' },
      { file: 'imgi_18_2-Overhaul-Kits.jpg', name: 'overhaul-kits.jpg', prodName: 'major-overhaul-kit.jpg' },
      { file: 'imgi_19_20-Overhaul-Gasket.jpg', name: 'overhaul-gasket.jpg', prodName: 'full-gasket-kit.jpg' },
      { file: 'imgi_20_heavy-equipment-starter-motors.jpg', name: 'starter-motor.jpg', prodName: 'starter-motor-24v.jpg' },
      { file: 'imgi_21_21-Alternator.jpg', name: 'alternator.jpg', prodName: 'alternator-60a.jpg' },
      { file: 'imgi_22_36-Glow-Plug.jpg', name: 'glow-plug.jpg', prodName: 'diesel-glow-plug.jpg' },
      { file: 'imgi_23_22-Stop-Solenoid.jpg', name: 'stop-solenoid.jpg', prodName: 'flameout-stop-solenoid.jpg' },
      { file: 'imgi_24_fridayparts-turbocharger.png', name: 'turbocharger-kit.png', prodName: 'turbocharger-he300vg.png' },
      { file: 'imgi_25_Manifold.png', name: 'manifold.png', prodName: 'exhaust-manifold.png' },
      { file: 'imgi_26_29-Muffler.jpg', name: 'muffler.jpg', prodName: 'exhaust-muffler.jpg' },
      { file: 'imgi_27_19-Oil-Pump.jpg', name: 'oil-pump.jpg', prodName: 'engine-oil-pump.jpg' },
      { file: 'imgi_28_fridayparts-engine-water-pump.jpg', name: 'water-pump.jpg', prodName: 'cooling-water-pump.jpg' },
      { file: 'imgi_29_24-Thermostat.jpg', name: 'thermostat.jpg', prodName: 'engine-thermostat.jpg' },
      { file: 'imgi_30_27-Belts.jpg', name: 'belts.jpg', prodName: 'serpentine-fan-belt.jpg' },
    ]
  },
  // 2. Electrical Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts',
    items: [
      { file: 'imgi_13_1-Controllers-Monitors.jpg', name: 'controllers-monitors.jpg', prodName: 'ecu-controller.jpg' },
      { file: 'imgi_14_Monitor_Display_Panel.png', name: 'monitor-display-panel.png', prodName: 'lcd-display-panel.png' },
      { file: 'imgi_15_control-box-for-heavy-equipment.jpg', name: 'control-box.jpg' },
      { file: 'imgi_16_solenoid-valve.png', name: 'solenoid-valve.png', prodName: 'hydraulic-solenoid-valve.png' },
      { file: 'imgi_17_68-Solenoid-Valve-Coil.jpg', name: 'solenoid-valve-coil.jpg' },
      { file: 'imgi_18_Speed_Governor_Actuator.png', name: 'speed-governor-actuator.png' },
      { file: 'imgi_19_5-Sensors.jpg', name: 'sensors.jpg', prodName: 'temperature-sensor.jpg' },
      { file: 'imgi_20_76-Gauge_-Meter-_-Indicator.jpg', name: 'gauge-meter-indicator.jpg' },
      { file: 'imgi_21_4-Lamps.jpg', name: 'lamps.jpg' },
      { file: 'imgi_22_81-Switch.jpg', name: 'switch.jpg' },
      { file: 'imgi_23_77-Ignition-Switch.jpg', name: 'ignition-switch.jpg', prodName: 'starter-key-switch.jpg' },
      { file: 'imgi_24_78-PTO-Switch.jpg', name: 'pto-switch.jpg' },
      { file: 'imgi_25_79-Pressure-Switch.jpg', name: 'pressure-switch.jpg' },
      { file: 'imgi_26_heavy-duty-battery-charger.jpg', name: 'battery-charger.jpg' },
      { file: 'imgi_27_8-Regulator.png', name: 'regulator.png' },
      { file: 'imgi_28_9-Relay_-Contactor-_-Fuse.jpg', name: 'relay-contactor-fuse.jpg' },
      { file: 'imgi_29_harness.png', name: 'wiring-harness.png', prodName: 'engine-wiring-harness.png' },
      { file: 'imgi_30_83-Cable.jpg', name: 'cable.jpg' },
    ]
  },
  // 3. Hydraulic & Pneumatic Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts (1)',
    items: [
      { file: 'imgi_13_1-Hydraulic-Motor.jpg', name: 'hydraulic-motor.jpg', prodName: 'hydraulic-drive-motor.jpg' },
      { file: 'imgi_14_hydraulic_pump_for_construction_machinery.jpg', name: 'hydraulic-pump.jpg', prodName: 'main-hydraulic-pump.jpg' },
      { file: 'imgi_15_7-Hydraulic-Pump-Parts.jpg', name: 'hydraulic-pump-parts.jpg' },
      { file: 'imgi_16_2-Hydraulic-Pump.jpg', name: 'gear-pump.jpg', prodName: 'tandem-gear-pump.jpg' },
      { file: 'imgi_17_main-_-relief-valve.png', name: 'main-relief-valve.png', prodName: 'main-relief-valve.png' },
      { file: 'imgi_18_joystick_pilot_valve.png', name: 'joystick-pilot-valve.png', prodName: 'joystick-valve.png' },
      { file: 'imgi_19_99-Control-Valve.jpg', name: 'control-valve.jpg' },
      { file: 'imgi_20_104-Regulator-Valve.jpg', name: 'regulator-valve.jpg' },
      { file: 'imgi_21_5-Hydraulic-Cylinder.jpg', name: 'hydraulic-cylinder.jpg' },
      { file: 'imgi_22_101-Bushing.jpg', name: 'bushing.jpg' },
      { file: 'imgi_23_4-Lift-Arm-_-Tach-Kit.jpg', name: 'lift-arm-tach-kit.jpg' },
      { file: 'imgi_24_103-Swivel-Joint.jpg', name: 'swivel-joint.jpg' },
      { file: 'imgi_25_hydraulic-coupler.png', name: 'hydraulic-coupler.png' },
      { file: 'imgi_26_Coupling.png', name: 'coupling.png' },
      { file: 'imgi_27_98-Hydraulic-Hose.jpg', name: 'hydraulic-hose.jpg' },
      { file: 'imgi_28_39-Brake-Air-Compressor.jpg', name: 'brake-air-compressor.jpg' },
      { file: 'imgi_29_pressure_regulator.jpg', name: 'pressure-regulator.jpg' },
      { file: 'imgi_30_drain_parts.jpg', name: 'drain-parts.jpg' },
    ]
  },
  // 4. Transmission & Undercarriage Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts (2)',
    items: [
      { file: 'imgi_13_120-Travel-Motor-_-Gearbox.jpg', name: 'travel-motor-gearbox.jpg', prodName: 'travel-final-drive.jpg' },
      { file: 'imgi_14_123-Swing-Motor-_-Gearbox.jpg', name: 'swing-motor-gearbox.jpg' },
      { file: 'imgi_15_2-Track-Roller.jpg', name: 'track-roller.jpg', prodName: 'bottom-track-roller.jpg' },
      { file: 'imgi_16_9-Carrier-Roller.jpg', name: 'carrier-roller.jpg', prodName: 'top-carrier-roller.jpg' },
      { file: 'imgi_17_Idler.png', name: 'idler.png', prodName: 'front-idler-assembly.png' },
      { file: 'imgi_18_7-Sprocket.jpg', name: 'sprocket.jpg', prodName: 'drive-sprocket-rim.jpg' },
      { file: 'imgi_19_142-Lowering_-Leveling-_-Lifting-Kits.jpg', name: 'lowering-leveling-lifting-kits.jpg' },
      { file: 'imgi_20_141-Ball-Joint.jpg', name: 'ball-joint.jpg' },
      { file: 'imgi_21_1-Clutch-Parts.jpg', name: 'clutch-parts.jpg' },
      { file: 'imgi_22_5-Torque-Converter.jpg', name: 'torque-converter.jpg' },
      { file: 'imgi_23_144-Transmission-Pump.jpg', name: 'transmission-pump.jpg' },
      { file: 'imgi_24_Differential.jpg', name: 'differential.jpg' },
      { file: 'imgi_25_idler.jpg', name: 'tensioner-idler.jpg' },
      { file: 'imgi_26_4-Bearing_-Gear-_-Shaft.jpg', name: 'bearing-gear-shaft.jpg' },
      { file: 'imgi_27_pto_shaft.png', name: 'pto-shaft.png' },
      { file: 'imgi_28_3-Tie-Rod.jpg', name: 'tie-rod.jpg' },
      { file: 'imgi_29_145-Steering-Pump.jpg', name: 'steering-pump.jpg' },
      { file: 'imgi_30_8-Brake-Discs_-Pads-_-Calipers.jpg', name: 'brake-discs-pads-calipers.jpg' },
    ]
  },
  // 5. Seals, Filters & Maintenance Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts (3)',
    items: [
      { file: 'imgi_13_cat-e70b-arm-cylinder-seal-kit_1_.jpg', name: 'arm-cylinder-seal-kit.jpg', prodName: 'arm-cylinder-seal-kit.jpg' },
      { file: 'imgi_14_109-Boom-Cylinder-Seal-Kit.jpg', name: 'boom-cylinder-seal-kit.jpg', prodName: 'boom-cylinder-seal-kit.jpg' },
      { file: 'imgi_15_110-Bucket-Cylinder-Seal-Kit.jpg', name: 'bucket-cylinder-seal-kit.jpg' },
      { file: 'imgi_16_114-Swing-Joint-Seal-Kit.jpg', name: 'swing-joint-seal-kit.jpg' },
      { file: 'imgi_17_72077A92-2D56-4937-8EB4-0434E76A421D.png', name: 'hydraulic-cylinder-seal-kit.png' },
      { file: 'imgi_18_aftermarket-diesel-fuel-filter_1.jpg', name: 'diesel-fuel-filter.jpg', prodName: 'fuel-filter-element.jpg' },
      { file: 'imgi_19_oil-filter.png', name: 'oil-filter.png', prodName: 'engine-oil-filter.png' },
      { file: 'imgi_20_aftermarket-air-filter.png', name: 'air-filter.png', prodName: 'air-filter-combo.png' },
      { file: 'imgi_21_hydraulic-filter.png', name: 'hydraulic-filter.png', prodName: 'hydraulic-oil-filter.png' },
      { file: 'imgi_22_6-Water-Separator.jpg', name: 'water-separator.jpg' },
      { file: 'imgi_23_Air-Cleaner.jpg', name: 'air-cleaner.jpg' },
      { file: 'imgi_24_filter-kit.png', name: 'filter-kit.png' },
      { file: 'imgi_25_189-ervice-Tank.jpg', name: 'service-tank.jpg' },
      { file: 'imgi_26_41-Radiator_-Oil-_-Fuel-Caps.jpg', name: 'radiator-oil-fuel-caps.jpg' },
      { file: 'imgi_27_199-Dust-Cover.jpg', name: 'dust-cover.jpg' },
      { file: 'imgi_28_33-Hose.jpg', name: 'hose.jpg' },
      { file: 'imgi_29_37-Tube-and-Pipe.jpg', name: 'tube-and-pipe.jpg' },
      { file: 'imgi_30_116-O-Ring-Box.jpg', name: 'o-ring-box.jpg', prodName: 'o-ring-service-kit.jpg' },
    ]
  },
  // 6. Cab & Body Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts (4)',
    items: [
      { file: 'imgi_13_Joystick_Controller.png', name: 'joystick-controller.png', prodName: 'hydraulic-joystick.png' },
      { file: 'imgi_14_175-Travel-Control-Knob.jpg', name: 'travel-control-knob.jpg' },
      { file: 'imgi_15_6-Foot-Valve_-Pedal-_-Floor-Mat.jpg', name: 'foot-valve-pedal-floor-mat.jpg' },
      { file: 'imgi_16_8-Lock.jpg', name: 'lock.jpg' },
      { file: 'imgi_17_FridayParts-keys.png', name: 'keys.png', prodName: 'universal-equipment-keys.png' },
      { file: 'imgi_18_174-Cab-Assembly.jpg', name: 'cab-assembly.jpg' },
      { file: 'imgi_19_7-Gas-Spring.jpg', name: 'gas-spring.jpg', prodName: 'hood-gas-spring.jpg' },
      { file: 'imgi_20_186-Soft-Top.jpg', name: 'soft-top.jpg' },
      { file: 'imgi_21_weatherstrip.jpg', name: 'weatherstrip.jpg' },
      { file: 'imgi_22_179-Other-Cab-Parts.jpg', name: 'other-cab-parts.jpg' },
      { file: 'imgi_23_176-Wiper-Arm-_-Blade.jpg', name: 'wiper-arm-blade.jpg' },
      { file: 'imgi_24_Power_Window_Motor.png', name: 'power-window-motor.png' },
      { file: 'imgi_25_178-Mirror.jpg', name: 'mirror.jpg' },
      { file: 'imgi_26_177-Decal.jpg', name: 'decal.jpg' },
      { file: 'imgi_27_173-Glass-_-Accessories.jpg', name: 'glass-accessories.jpg' },
      { file: 'imgi_28_doorhandle.jpg', name: 'door-handle.jpg' },
      { file: 'imgi_29_180-Propeller.jpg', name: 'propeller.jpg' },
      { file: 'imgi_30_185-Other-Body-Parts.jpg', name: 'other-body-parts.jpg' },
    ]
  },
  // 7. HVAC Parts
  {
    srcDir: 'Aftermarket Parts, Spare Parts for Excavators, Loaders, Aerial Work Platforms, Tractors _ FridayParts (5)',
    items: [
      { file: 'imgi_13_50-Engine-Block-Heater.jpg', name: 'engine-block-heater.jpg' },
      { file: 'imgi_14_air_heater.jpg', name: 'air-heater.jpg' },
      { file: 'imgi_15_heater_core.jpg', name: 'heater-core.jpg' },
      { file: 'imgi_16_heavy-duty-blower-motor.jpg', name: 'blower-motor.jpg', prodName: 'cabin-blower-motor.jpg' },
      { file: 'imgi_17_air-conditioning-compressor.png', name: 'ac-compressor.png', prodName: 'air-conditioner-compressor.png' },
      { file: 'imgi_18_181-A-C-Receiver-Drier.jpg', name: 'ac-receiver-drier.jpg' },
      { file: 'imgi_19_182-A-C-Condenser.jpg', name: 'ac-condenser.jpg' },
      { file: 'imgi_20_183-A-C-Expansion-Valve.jpg', name: 'ac-expansion-valve.jpg' },
      { file: 'imgi_21_a-c-evaporator.png', name: 'ac-evaporator.png' },
      { file: 'imgi_22_184-Other-Air-Conditioning-Parts.jpg', name: 'other-ac-parts.jpg' },
      { file: 'imgi_23_Water_Tank_Radiator.png', name: 'water-tank-radiator.png', prodName: 'engine-radiator-aluminum.png' },
      { file: 'imgi_24_30-Hydraulic-Oil-Cooler.jpg', name: 'hydraulic-oil-cooler.jpg', prodName: 'aluminum-oil-cooler.jpg' },
      { file: 'imgi_25_Intercooler.png', name: 'intercooler.png' },
      { file: 'imgi_26_Aftercooler.png', name: 'aftercooler.png' },
      { file: 'imgi_27_fan.jpg', name: 'fan.jpg' },
      { file: 'imgi_28_fanmount.jpg', name: 'fan-mount.jpg' },
      { file: 'imgi_29_Vibrasorber_Suction.png', name: 'vibrasorber-suction.png' },
      { file: 'imgi_30_hvac.jpg', name: 'hvac.jpg' },
    ]
  }
];

let catCopied = 0;
let prodCopied = 0;

for (const group of mappings) {
  const dirPath = path.join(SRC_BASE, group.srcDir);
  for (const item of group.items) {
    const srcFile = path.join(dirPath, item.file);
    if (fs.existsSync(srcFile)) {
      // 1. Copy to categories directory
      const destCat = path.join(DEST_CATEGORIES, item.name);
      fs.copyFileSync(srcFile, destCat);
      catCopied++;

      // 2. If specified, copy to products directory with product-friendly name
      if (item.prodName) {
        const destProd = path.join(DEST_PRODUCTS, item.prodName);
        fs.copyFileSync(srcFile, destProd);
        prodCopied++;
      }
    } else {
      console.warn('Source file not found:', srcFile);
    }
  }
}

console.log(`Successfully copied ${catCopied} category images to ${DEST_CATEGORIES}`);
console.log(`Successfully copied ${prodCopied} product images to ${DEST_PRODUCTS}`);
