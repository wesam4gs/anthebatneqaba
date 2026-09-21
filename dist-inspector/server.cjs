var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");

// src/data/initialData.ts
var INITIAL_PROVINCES = [
  { id: "iq_baghdad", nameAr: "\u0628\u063A\u062F\u0627\u062F", nameEn: "Baghdad", centerLat: 33.3152, centerLng: 44.3661, zoomLevel: 12 },
  { id: "iq_basra", nameAr: "\u0627\u0644\u0628\u0635\u0631\u0629", nameEn: "Basra", centerLat: 30.5081, centerLng: 47.7835, zoomLevel: 12 },
  { id: "iq_nineveh", nameAr: "\u0646\u064A\u0646\u0648\u0649", nameEn: "Nineveh", centerLat: 36.34, centerLng: 43.13, zoomLevel: 11 },
  { id: "iq_erbil", nameAr: "\u0623\u0631\u0628\u064A\u0644", nameEn: "Erbil", centerLat: 36.1901, centerLng: 44.0091, zoomLevel: 12 },
  { id: "iq_sulaymaniyah", nameAr: "\u0627\u0644\u0633\u0644\u064A\u0645\u0627\u0646\u064A\u0629", nameEn: "Sulaymaniyah", centerLat: 35.556, centerLng: 45.437, zoomLevel: 12 },
  { id: "iq_duhok", nameAr: "\u062F\u0647\u0648\u0643", nameEn: "Duhok", centerLat: 36.8679, centerLng: 42.988, zoomLevel: 12 },
  { id: "iq_najaf", nameAr: "\u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641", nameEn: "Najaf", centerLat: 32, centerLng: 44.3333, zoomLevel: 12 },
  { id: "iq_karbala", nameAr: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629", nameEn: "Karbala", centerLat: 32.616, centerLng: 44.025, zoomLevel: 12 },
  { id: "iq_babel", nameAr: "\u0628\u0627\u0628\u0644", nameEn: "Babil", centerLat: 32.4637, centerLng: 44.4312, zoomLevel: 12 },
  { id: "iq_wasit", nameAr: "\u0648\u0627\u0633\u0637", nameEn: "Wasit", centerLat: 32.5122, centerLng: 45.8164, zoomLevel: 12 },
  { id: "iq_dhi_qar", nameAr: "\u0630\u064A \u0642\u0627\u0631", nameEn: "Dhi Qar", centerLat: 31.058, centerLng: 46.257, zoomLevel: 12 },
  { id: "iq_qadisiyyah", nameAr: "\u0627\u0644\u0642\u0627\u062F\u0633\u064A\u0629 (\u0627\u0644\u062F\u064A\u0648\u0627\u0646\u064A\u0629)", nameEn: "Al-Qadisiyyah", centerLat: 31.9922, centerLng: 44.9222, zoomLevel: 12 },
  { id: "iq_maysan", nameAr: "\u0645\u064A\u0633\u0627\u0646", nameEn: "Maysan", centerLat: 31.836, centerLng: 47.145, zoomLevel: 12 },
  { id: "iq_muthanna", nameAr: "\u0627\u0644\u0645\u062B\u0646\u0649", nameEn: "Al-Muthanna", centerLat: 31.313, centerLng: 45.281, zoomLevel: 12 },
  { id: "iq_diyala", nameAr: "\u062F\u064A\u0627\u0644\u0649", nameEn: "Diyala", centerLat: 33.75, centerLng: 45.15, zoomLevel: 12 },
  { id: "iq_anbar", nameAr: "\u0627\u0644\u0623\u0646\u0628\u0627\u0631", nameEn: "Al-Anbar", centerLat: 33.421, centerLng: 43.298, zoomLevel: 11 },
  { id: "iq_saladin", nameAr: "\u0635\u0644\u0627\u062D \u0627\u0644\u062F\u064A\u0646", nameEn: "Saladin", centerLat: 34.6, centerLng: 43.68, zoomLevel: 11 },
  { id: "iq_kirkuk", nameAr: "\u0643\u0631\u0643\u0648\u0643", nameEn: "Kirkuk", centerLat: 35.4681, centerLng: 44.3922, zoomLevel: 12 }
];
var INITIAL_DISTRICT_ZONES = [
  // 1. بغداد
  {
    id: "zone_karkh",
    provinceId: "iq_baghdad",
    nameAr: "\u0628\u063A\u062F\u0627\u062F - \u0642\u0637\u0627\u0639 \u0627\u0644\u0643\u0631\u062E",
    code: "BGD-KARKH",
    centerLat: 33.308,
    centerLng: 44.34,
    neighborhoods: [
      "\u0627\u0644\u0645\u0646\u0635\u0648\u0631",
      "\u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
      "\u0627\u0644\u064A\u0631\u0645\u0648\u0643",
      "\u0627\u0644\u0628\u064A\u0627\u0639",
      "\u0627\u0644\u062F\u0648\u0631\u0629",
      "\u0627\u0644\u0639\u0627\u0645\u0631\u064A\u0629",
      "\u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
      "\u062D\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0629",
      "\u0627\u0644\u0633\u064A\u062F\u064A\u0629",
      "\u0627\u0644\u063A\u0632\u0627\u0644\u064A\u0629",
      "\u0627\u0644\u0634\u0639\u0644\u0629",
      "\u0627\u0644\u0639\u0637\u064A\u0641\u064A\u0629",
      "\u0639\u0644\u0627\u0648\u064A \u0627\u0644\u062D\u0644\u0629",
      "\u062D\u064A \u0627\u0644\u062E\u0636\u0631\u0627\u0621",
      "\u062D\u064A \u0627\u0644\u062C\u0647\u0627\u062F",
      "\u062D\u064A \u0627\u0644\u0639\u0627\u0645\u0644",
      "\u062D\u064A \u0627\u0644\u0642\u0627\u062F\u0633\u064A\u0629",
      "\u062D\u064A \u0627\u0644\u0639\u062F\u0644",
      "\u062D\u064A \u0627\u0644\u0633\u0644\u0627\u0645",
      "\u062D\u064A \u0627\u0644\u0634\u0631\u0637\u0629 \u0627\u0644\u062E\u0627\u0645\u0633\u0629",
      "\u062D\u064A \u0627\u0644\u0625\u0639\u0644\u0627\u0645",
      "\u062D\u064A \u0627\u0644\u0634\u0628\u0627\u0628",
      "\u062D\u064A \u0627\u0644\u0639\u0631\u0628\u064A",
      "\u0623\u0628\u0648 \u063A\u0631\u064A\u0628",
      "\u0627\u0644\u062A\u0627\u062C\u064A"
    ]
  },
  {
    id: "zone_rusafa",
    provinceId: "iq_baghdad",
    nameAr: "\u0628\u063A\u062F\u0627\u062F - \u0642\u0637\u0627\u0639 \u0627\u0644\u0631\u0635\u0627\u0641\u0629",
    code: "BGD-RUSAFA",
    centerLat: 33.325,
    centerLng: 44.42,
    neighborhoods: [
      "\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
      "\u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629",
      "\u0632\u064A\u0648\u0646\u0629",
      "\u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646",
      "\u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629",
      "\u0627\u0644\u0635\u0644\u064A\u062E",
      "\u0627\u0644\u0642\u0627\u0647\u0631\u0629",
      "\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0635\u062F\u0631",
      "\u0627\u0644\u0634\u0639\u0628",
      "\u0628\u063A\u062F\u0627\u062F \u0627\u0644\u062C\u062F\u064A\u062F\u0629",
      "\u0627\u0644\u0645\u0634\u062A\u0644",
      "\u0627\u0644\u0639\u0628\u064A\u062F\u064A",
      "\u0643\u0645\u0628 \u0633\u0627\u0631\u0629",
      "\u0627\u0644\u0628\u0627\u0628 \u0627\u0644\u0645\u0639\u0638\u0645",
      "\u0627\u0644\u0645\u064A\u062F\u0627\u0646",
      "\u0627\u0644\u0641\u0636\u0644",
      "\u0634\u0627\u0631\u0639 \u0627\u0644\u0646\u0636\u0627\u0644",
      "\u0627\u0644\u0633\u0639\u062F\u0648\u0646",
      "\u0634\u0627\u0631\u0639 \u0627\u0644\u0645\u063A\u0631\u0628",
      "\u0627\u0644\u0643\u0633\u0631\u0629",
      "\u0627\u0644\u0632\u0639\u0641\u0631\u0627\u0646\u064A\u0629",
      "\u062D\u0633\u064A\u0646\u064A\u0629 \u0627\u0644\u0645\u0639\u0627\u0645\u0644",
      "\u0627\u0644\u0645\u062F\u0627\u0626\u0646"
    ]
  },
  // 2. البصرة
  {
    id: "zone_basra_center",
    provinceId: "iq_basra",
    nameAr: "\u0627\u0644\u0628\u0635\u0631\u0629 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0627\u0644\u0628\u0631\u0627\u0636\u0639\u064A\u0629",
    code: "BSR-CENTER",
    centerLat: 30.5081,
    centerLng: 47.7835,
    neighborhoods: ["\u0627\u0644\u0628\u0631\u0627\u0636\u0639\u064A\u0629", "\u0627\u0644\u062C\u0628\u064A\u0644\u0629", "\u0627\u0644\u062C\u0632\u0627\u0626\u0631", "\u0627\u0644\u0637\u0648\u064A\u0633\u0629", "\u0627\u0644\u0639\u0634\u0627\u0631", "\u0627\u0644\u0645\u0639\u0642\u0644", "\u062D\u064A \u0627\u0644\u062D\u0633\u064A\u0646", "\u0627\u0644\u062E\u0648\u0631\u0629"]
  },
  {
    id: "zone_basra_zubair",
    provinceId: "iq_basra",
    nameAr: "\u0627\u0644\u0628\u0635\u0631\u0629 - \u0642\u0636\u0627\u0621 \u0627\u0644\u0632\u0628\u064A\u0631 \u0648\u0635\u0641\u0648\u0627\u0646",
    code: "BSR-ZUBAIR",
    centerLat: 30.39,
    centerLng: 47.7,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0632\u0628\u064A\u0631", "\u0646\u0627\u062D\u064A\u0629 \u0635\u0641\u0648\u0627\u0646", "\u0623\u0645 \u0642\u0635\u0631", "\u062E\u0648\u0631 \u0627\u0644\u0632\u0628\u064A\u0631"]
  },
  {
    id: "zone_basra_qurna",
    provinceId: "iq_basra",
    nameAr: "\u0627\u0644\u0628\u0635\u0631\u0629 - \u0634\u0645\u0627\u0644 \u0627\u0644\u0628\u0635\u0631\u0629 \u0648\u0627\u0644\u0642\u0631\u0646\u0629",
    code: "BSR-QURNA",
    centerLat: 31.01,
    centerLng: 47.43,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0642\u0631\u0646\u0629", "\u0646\u0627\u062D\u064A\u0629 \u0627\u0644\u0647\u0627\u0631\u062B\u0629", "\u0634\u0637 \u0627\u0644\u0639\u0631\u0628", "\u0627\u0644\u062F\u064A\u0631", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629"]
  },
  // 3. نينوى
  {
    id: "zone_nineveh_mosul_left",
    provinceId: "iq_nineveh",
    nameAr: "\u0646\u064A\u0646\u0648\u0649 - \u0627\u0644\u0645\u0648\u0635\u0644 \u0627\u0644\u062C\u0627\u0646\u0628 \u0627\u0644\u0623\u064A\u0633\u0631",
    code: "NIN-MOSUL-L",
    centerLat: 36.35,
    centerLng: 43.15,
    neighborhoods: ["\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629", "\u062D\u064A \u0627\u0644\u0632\u0647\u0648\u0631", "\u062D\u064A \u0627\u0644\u0633\u0643\u0631", "\u062D\u064A \u0627\u0644\u0645\u0635\u0627\u0631\u0641", "\u062D\u064A \u0627\u0644\u0639\u0631\u0628\u064A", "\u062D\u064A \u0627\u0644\u062D\u062F\u0628\u0627\u0621"]
  },
  {
    id: "zone_nineveh_mosul_right",
    provinceId: "iq_nineveh",
    nameAr: "\u0646\u064A\u0646\u0648\u0649 - \u0627\u0644\u0645\u0648\u0635\u0644 \u0627\u0644\u062C\u0627\u0646\u0628 \u0627\u0644\u0623\u064A\u0645\u0646",
    code: "NIN-MOSUL-R",
    centerLat: 36.33,
    centerLng: 43.11,
    neighborhoods: ["\u0627\u0644\u062F\u0648\u0627\u0633\u0629", "\u0627\u0644\u0646\u0628\u064A \u0634\u064A\u062A", "\u0627\u0644\u0639\u0643\u064A\u062F\u0627\u062A", "\u062D\u064A \u0627\u0644\u0639\u0627\u0645\u0644", "\u0627\u0644\u063A\u0632\u0644\u0627\u0646\u064A", "\u0648\u0627\u062F\u064A \u062D\u062C\u0631"]
  },
  {
    id: "zone_nineveh_plains",
    provinceId: "iq_nineveh",
    nameAr: "\u0646\u064A\u0646\u0648\u0649 - \u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u0645\u062F\u0627\u0646\u064A\u0629 \u0648\u062A\u0644\u0643\u064A\u0641",
    code: "NIN-PLAINS",
    centerLat: 36.27,
    centerLng: 43.37,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u0645\u062F\u0627\u0646\u064A\u0629", "\u0642\u0636\u0627\u0621 \u062A\u0644\u0643\u064A\u0641", "\u0646\u0627\u062D\u064A\u0629 \u0628\u0639\u0634\u064A\u0642\u0629", "\u0627\u0644\u0634\u064A\u062E\u0627\u0646", "\u0639\u0642\u0631\u0629"]
  },
  // 4. أربيل
  {
    id: "zone_erbil_center",
    provinceId: "iq_erbil",
    nameAr: "\u0623\u0631\u0628\u064A\u0644 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0639\u064A\u0646\u0643\u0627\u0648\u0629",
    code: "EBL-CENTER",
    centerLat: 36.1901,
    centerLng: 44.0091,
    neighborhoods: ["\u0646\u0627\u062D\u064A\u0629 \u0639\u064A\u0646\u0643\u0627\u0648\u0629", "\u0642\u0644\u0639\u0629 \u0623\u0631\u0628\u064A\u0644", "\u062D\u064A \u0625\u0633\u0643\u0627\u0646", "\u062D\u064A \u0634\u0648\u0631\u0634", "\u0634\u0627\u0631\u0639 100 \u0645\u062A\u0631\u064A", "\u0634\u0627\u0631\u0639 60 \u0645\u062A\u0631\u064A"]
  },
  {
    id: "zone_erbil_outer",
    provinceId: "iq_erbil",
    nameAr: "\u0623\u0631\u0628\u064A\u0644 - \u0623\u0642\u0636\u064A\u0629 \u0634\u0642\u0644\u0627\u0648\u0629 \u0648\u0633\u0648\u0631\u0627\u0646",
    code: "EBL-OUTER",
    centerLat: 36.4,
    centerLng: 44.32,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0634\u0642\u0644\u0627\u0648\u0629", "\u0642\u0636\u0627\u0621 \u0633\u0648\u0631\u0627\u0646", "\u0642\u0636\u0627\u0621 \u0643\u0648\u064A\u0629", "\u0642\u0636\u0627\u0621 \u0645\u064A\u0631\u0643\u0633\u0648\u0631"]
  },
  // 5. السليمانية
  {
    id: "zone_suly_center",
    provinceId: "iq_sulaymaniyah",
    nameAr: "\u0627\u0644\u0633\u0644\u064A\u0645\u0627\u0646\u064A\u0629 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0633\u0631\u062C\u0646\u0627\u0631",
    code: "SLY-CENTER",
    centerLat: 35.556,
    centerLng: 45.437,
    neighborhoods: ["\u0645\u0646\u0637\u0642\u0629 \u0633\u0631\u062C\u0646\u0627\u0631", "\u062D\u064A \u0628\u062E\u062A\u064A\u0627\u0631\u064A", "\u062D\u064A \u0639\u0642\u0627\u0631\u064A", "\u062D\u064A \u0631\u0627\u0628\u0631\u064A\u0646", "\u062D\u064A \u062C\u0642 \u062C\u0642", "\u062D\u064A \u0645\u0644\u0643\u0646\u062F\u064A"]
  },
  {
    id: "zone_suly_outer",
    provinceId: "iq_sulaymaniyah",
    nameAr: "\u0627\u0644\u0633\u0644\u064A\u0645\u0627\u0646\u064A\u0629 - \u0623\u0642\u0636\u064A\u0629 \u062D\u0644\u0628\u062C\u0629 \u0648\u0631\u0627\u0646\u064A\u0629",
    code: "SLY-OUTER",
    centerLat: 35.25,
    centerLng: 45.98,
    neighborhoods: ["\u0645\u062D\u0627\u0641\u0638\u0629 \u062D\u0644\u0628\u062C\u0629", "\u0642\u0636\u0627\u0621 \u0631\u0627\u0646\u064A\u0629", "\u0642\u0636\u0627\u0621 \u062F\u0648\u0643\u0627\u0646", "\u0642\u0636\u0627\u0621 \u0643\u0644\u0627\u0631", "\u0642\u0636\u0627\u0621 \u062F\u0631\u0628\u0646\u062F\u062E\u0627\u0646"]
  },
  // 6. دهوك
  {
    id: "zone_duhok_center",
    provinceId: "iq_duhok",
    nameAr: "\u062F\u0647\u0648\u0643 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0633\u0645\u064A\u0644",
    code: "DHK-CENTER",
    centerLat: 36.8679,
    centerLng: 42.988,
    neighborhoods: ["\u0645\u0631\u0643\u0632 \u0645\u062F\u064A\u0646\u0629 \u062F\u0647\u0648\u0643", "\u0642\u0636\u0627\u0621 \u0633\u0645\u064A\u0644", "\u062D\u064A \u0634\u0648\u0632", "\u062D\u064A \u0634\u0631\u0641\u064A\u0629"]
  },
  {
    id: "zone_duhok_zakho",
    provinceId: "iq_duhok",
    nameAr: "\u062F\u0647\u0648\u0643 - \u0642\u0636\u0627\u0621 \u0632\u0627\u062E\u0648 \u0648\u0627\u0644\u0639\u0645\u0627\u062F\u064A\u0629",
    code: "DHK-ZAKHO",
    centerLat: 37.14,
    centerLng: 42.68,
    neighborhoods: ["\u0625\u062F\u0627\u0631\u0629 \u0632\u0627\u062E\u0648 \u0627\u0644\u0645\u0633\u062A\u0642\u0644\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0639\u0645\u0627\u062F\u064A\u0629", "\u0642\u0636\u0627\u0621 \u0628\u0631\u062F\u0631\u0634"]
  },
  // 7. النجف الأشرف
  {
    id: "zone_najaf_center",
    provinceId: "iq_najaf",
    nameAr: "\u0627\u0644\u0646\u062C\u0641 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0642\u062F\u064A\u0645\u0629",
    code: "NJF-CENTER",
    centerLat: 32,
    centerLng: 44.3333,
    neighborhoods: ["\u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0648\u0641\u0629", "\u062D\u064A \u0627\u0644\u062D\u0646\u0627\u0646\u0629", "\u062D\u064A \u0627\u0644\u0623\u0645\u064A\u0631", "\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0642\u062F\u064A\u0645\u0629", "\u062D\u064A \u0627\u0644\u0623\u0646\u0635\u0627\u0631", "\u062D\u064A \u0627\u0644\u0633\u0644\u0627\u0645"]
  },
  {
    id: "zone_najaf_kufa",
    provinceId: "iq_najaf",
    nameAr: "\u0627\u0644\u0646\u062C\u0641 - \u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0648\u0641\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0630\u0631\u0629",
    code: "NJF-KUFA",
    centerLat: 32.03,
    centerLng: 44.4,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0648\u0641\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0646\u0627\u0630\u0631\u0629", "\u0646\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u062E\u0627\u0628", "\u0646\u0627\u062D\u064A\u0629 \u0627\u0644\u0639\u0628\u0627\u0633\u064A\u0629"]
  },
  // 8. كربلاء المقدسة
  {
    id: "zone_karbala_center",
    provinceId: "iq_karbala",
    nameAr: "\u0643\u0631\u0628\u0644\u0627\u0621 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0627\u0644\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0642\u062F\u064A\u0645\u0629",
    code: "KRB-CENTER",
    centerLat: 32.616,
    centerLng: 44.025,
    neighborhoods: ["\u062D\u064A \u0627\u0644\u062D\u0633\u064A\u0646", "\u062D\u064A \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646", "\u0634\u0627\u0631\u0639 \u0627\u0644\u0633\u062F\u0631\u0629", "\u062D\u064A \u0627\u0644\u0623\u0633\u0631\u0629", "\u062D\u064A \u0627\u0644\u0646\u0635\u0631", "\u062D\u064A \u0627\u0644\u0639\u0628\u0627\u0633"]
  },
  {
    id: "zone_karbala_outer",
    provinceId: "iq_karbala",
    nameAr: "\u0643\u0631\u0628\u0644\u0627\u0621 - \u0642\u0636\u0627\u0621 \u0627\u0644\u0647\u0646\u062F\u064A\u0629 \u0648\u0639\u064A\u0646 \u0627\u0644\u062A\u0645\u0631",
    code: "KRB-OUTER",
    centerLat: 32.55,
    centerLng: 43.5,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0647\u0646\u062F\u064A\u0629 (\u0637\u0648\u064A\u0631\u064A\u062C)", "\u0642\u0636\u0627\u0621 \u0639\u064A\u0646 \u0627\u0644\u062A\u0645\u0631", "\u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u0631", "\u0627\u0644\u062C\u062F\u0648\u0644 \u0627\u0644\u063A\u0631\u0628\u064A"]
  },
  // 9. بابل
  {
    id: "zone_babil_center",
    provinceId: "iq_babel",
    nameAr: "\u0628\u0627\u0628\u0644 - \u0641\u0631\u0639 \u0627\u0644\u062D\u0644\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0632",
    code: "BBL-CENTER",
    centerLat: 32.4637,
    centerLng: 44.4312,
    neighborhoods: ["\u062D\u064A \u0646\u0627\u062F\u0631", "\u0634\u0627\u0631\u0639 40", "\u062D\u064A \u0627\u0644\u0645\u062D\u0627\u0631\u0628\u064A\u0646", "\u062D\u064A \u0627\u0644\u062C\u0645\u0639\u064A\u0629", "\u062D\u064A \u0627\u0644\u0636\u0628\u0627\u0637", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0641\u0644"]
  },
  {
    id: "zone_babil_north",
    provinceId: "iq_babel",
    nameAr: "\u0628\u0627\u0628\u0644 - \u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u0648\u064A\u0644 \u0648\u0627\u0644\u0645\u0633\u064A\u0628",
    code: "BBL-NORTH",
    centerLat: 32.66,
    centerLng: 44.4,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u062D\u0627\u0648\u064A\u0644", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0633\u064A\u0628", "\u0646\u0627\u062D\u064A\u0629 \u0627\u0644\u0625\u0633\u0643\u0646\u062F\u0631\u064A\u0629", "\u062C\u0631\u0641 \u0627\u0644\u0646\u0635\u0631"]
  },
  // 10. واسط
  {
    id: "zone_wasit_kut",
    provinceId: "iq_wasit",
    nameAr: "\u0648\u0627\u0633\u0637 - \u0641\u0631\u0639 \u0627\u0644\u0643\u0648\u062A \u0648\u0627\u0644\u0646\u0639\u0645\u0627\u0646\u064A\u0629",
    code: "WST-KUT",
    centerLat: 32.5122,
    centerLng: 45.8164,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0643\u0648\u062A", "\u062D\u064A \u0627\u0644\u0643\u0641\u0627\u0621\u0627\u062A", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0646\u0639\u0645\u0627\u0646\u064A\u0629", "\u062D\u064A \u0627\u0644\u0632\u0647\u0631\u0627\u0621"]
  },
  {
    id: "zone_wasit_south",
    provinceId: "iq_wasit",
    nameAr: "\u0648\u0627\u0633\u0637 - \u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u064A \u0648\u0627\u0644\u0635\u0648\u064A\u0631\u0629",
    code: "WST-SOUTH",
    centerLat: 32.17,
    centerLng: 46.04,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u064A", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0635\u0648\u064A\u0631\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0639\u0632\u064A\u0632\u064A\u0629", "\u0646\u0627\u062D\u064A\u0629 \u0628\u062F\u0631\u0629"]
  },
  // 11. ذي قار
  {
    id: "zone_dhiqar_nasiriya",
    provinceId: "iq_dhi_qar",
    nameAr: "\u0630\u064A \u0642\u0627\u0631 - \u0641\u0631\u0639 \u0627\u0644\u0646\u0627\u0635\u0631\u064A\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0632",
    code: "DQR-NASIRIYA",
    centerLat: 31.058,
    centerLng: 46.257,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0646\u0627\u0635\u0631\u064A\u0629", "\u062D\u064A \u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0629", "\u062D\u064A \u0627\u0631\u064A\u062F\u0648", "\u062D\u064A \u0627\u0644\u062B\u0648\u0631\u0629", "\u062D\u064A \u0627\u0644\u062A\u0636\u062D\u064A\u0629"]
  },
  {
    id: "zone_dhiqar_outer",
    provinceId: "iq_dhi_qar",
    nameAr: "\u0630\u064A \u0642\u0627\u0631 - \u0623\u0642\u0636\u064A\u0629 \u0627\u0644\u0634\u0637\u0631\u0629 \u0648\u0633\u0648\u0642 \u0627\u0644\u0634\u064A\u0648\u062E",
    code: "DQR-OUTER",
    centerLat: 31.41,
    centerLng: 46.17,
    neighborhoods: ["\u0642\u0636\u0627\u0621 \u0627\u0644\u0634\u0637\u0631\u0629", "\u0642\u0636\u0627\u0621 \u0633\u0648\u0642 \u0627\u0644\u0634\u064A\u0648\u062E", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0641\u0627\u0639\u064A", "\u0646\u0627\u062D\u064A\u0629 \u0627\u0644\u062C\u0628\u0627\u064A\u0634 (\u0627\u0644\u0623\u0647\u0648\u0627\u0631)"]
  },
  // 12. القادسية (الديوانية)
  {
    id: "zone_qadisiyyah_center",
    provinceId: "iq_qadisiyyah",
    nameAr: "\u0627\u0644\u0642\u0627\u062F\u0633\u064A\u0629 - \u0641\u0631\u0639 \u0627\u0644\u062F\u064A\u0648\u0627\u0646\u064A\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0632",
    code: "QDS-CENTER",
    centerLat: 31.9922,
    centerLng: 44.9222,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u062F\u064A\u0648\u0627\u0646\u064A\u0629", "\u062D\u064A \u0627\u0644\u0639\u0631\u0648\u0628\u0629", "\u062D\u064A \u0627\u0644\u062C\u0632\u0627\u0626\u0631", "\u062D\u064A \u0627\u0644\u0646\u0647\u0636\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0634\u0627\u0645\u064A\u0629", "\u0642\u0636\u0627\u0621 \u0639\u0641\u0643"]
  },
  // 13. ميسان
  {
    id: "zone_maysan_amarah",
    provinceId: "iq_maysan",
    nameAr: "\u0645\u064A\u0633\u0627\u0646 - \u0641\u0631\u0639 \u0627\u0644\u0639\u0645\u0627\u0631\u0629 \u0648\u0627\u0644\u0645\u0631\u0643\u0632",
    code: "MSN-AMARAH",
    centerLat: 31.836,
    centerLng: 47.145,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0639\u0645\u0627\u0631\u0629", "\u062D\u064A \u0627\u0644\u0645\u0639\u0644\u0645\u064A\u0646", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u064A\u0645\u0648\u0646\u0629", "\u0642\u0636\u0627\u0621 \u0639\u0644\u064A \u0627\u0644\u063A\u0631\u0628\u064A", "\u0642\u0636\u0627\u0621 \u0642\u0644\u0639\u0629 \u0635\u0627\u0644\u062D"]
  },
  // 14. المثنى
  {
    id: "zone_muthanna_samawah",
    provinceId: "iq_muthanna",
    nameAr: "\u0627\u0644\u0645\u062B\u0646\u0649 - \u0641\u0631\u0639 \u0627\u0644\u0633\u0645\u0627\u0648\u0629 \u0648\u0627\u0644\u0631\u0645\u064A\u062B\u0629",
    code: "MTN-SAMAWAH",
    centerLat: 31.313,
    centerLng: 45.281,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0633\u0645\u0627\u0648\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0645\u064A\u062B\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u062E\u0636\u0631", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0633\u0644\u0645\u0627\u0646"]
  },
  // 15. ديالى
  {
    id: "zone_diyala_baqubah",
    provinceId: "iq_diyala",
    nameAr: "\u062F\u064A\u0627\u0644\u0649 - \u0641\u0631\u0639 \u0628\u0639\u0642\u0648\u0628\u0629 \u0648\u0627\u0644\u0645\u0642\u062F\u0627\u062F\u064A\u0629",
    code: "DYL-BAQUBAH",
    centerLat: 33.75,
    centerLng: 45.15,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0628\u0639\u0642\u0648\u0628\u0629", "\u062D\u064A \u0627\u0644\u0645\u0639\u0644\u0645\u064A\u0646", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0627\u062F\u064A\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u062E\u0627\u0644\u0635", "\u0642\u0636\u0627\u0621 \u062E\u0627\u0646\u0642\u064A\u0646"]
  },
  // 16. الأنبار
  {
    id: "zone_anbar_ramadi",
    provinceId: "iq_anbar",
    nameAr: "\u0627\u0644\u0623\u0646\u0628\u0627\u0631 - \u0642\u0637\u0627\u0639 \u0627\u0644\u0631\u0645\u0627\u062F\u064A \u0648\u0627\u0644\u0641\u0644\u0648\u062C\u0629",
    code: "ANB-RAMADI",
    centerLat: 33.421,
    centerLng: 43.298,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0631\u0645\u0627\u062F\u064A", "\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0641\u0644\u0648\u062C\u0629", "\u062D\u064A \u0627\u0644\u0636\u0628\u0627\u0637", "\u0642\u0636\u0627\u0621 \u0647\u064A\u062A", "\u0642\u0636\u0627\u0621 \u0627\u0644\u0642\u0627\u0626\u0645", "\u0642\u0636\u0627\u0621 \u062D\u062F\u064A\u062B\u0629"]
  },
  // 17. صلاح الدين
  {
    id: "zone_saladin_tikrit",
    provinceId: "iq_saladin",
    nameAr: "\u0635\u0644\u0627\u062D \u0627\u0644\u062F\u064A\u0646 - \u0642\u0637\u0627\u0639 \u062A\u0643\u0631\u064A\u062A \u0648\u0633\u0627\u0645\u0631\u0627\u0621",
    code: "SLD-TIKRIT",
    centerLat: 34.6,
    centerLng: 43.68,
    neighborhoods: ["\u0645\u062F\u064A\u0646\u0629 \u062A\u0643\u0631\u064A\u062A", "\u0642\u0636\u0627\u0621 \u0633\u0627\u0645\u0631\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629", "\u0642\u0636\u0627\u0621 \u0628\u0644\u062F", "\u0642\u0636\u0627\u0621 \u0637\u0648\u0632\u062E\u0648\u0631\u0645\u0627\u062A\u0648", "\u0642\u0636\u0627\u0621 \u0628\u064A\u062C\u064A"]
  },
  // 18. كركوك
  {
    id: "zone_kirkuk_center",
    provinceId: "iq_kirkuk",
    nameAr: "\u0643\u0631\u0643\u0648\u0643 - \u0641\u0631\u0639 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0627\u0644\u062D\u0648\u064A\u062C\u0629",
    code: "KRK-CENTER",
    centerLat: 35.4681,
    centerLng: 44.3922,
    neighborhoods: ["\u0634\u0627\u0631\u0639 \u0627\u0644\u0642\u062F\u0633", "\u062D\u064A \u0631\u062D\u064A\u0645\u0627\u0648\u0629", "\u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u0648\u064A\u062C\u0629", "\u0642\u0636\u0627\u0621 \u062F\u0627\u0642\u0648\u0642", "\u0642\u0636\u0627\u0621 \u0627\u0644\u062F\u0628\u0633"]
  }
];
var INITIAL_USERS = [
  {
    id: "user_1",
    name: "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A (\u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A)",
    role: "HIGH_COMMAND",
    roleTitle: "\u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A \u2014 \u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645",
    badgeNumber: "NURSE-HQ-001",
    phone: "07701112233",
    email: "president@syndicate-nurse.iq",
    username: "hq_tamimi",
    password: "Nq123!Tamimi",
    nationalId: "198210928374",
    educationQualification: "\u062F\u0643\u062A\u0648\u0631\u0627\u0647 \u0641\u064A \u0627\u0644\u0639\u0644\u0648\u0645 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0635\u062D\u064A\u0629",
    specialization: "\u0625\u062F\u0627\u0631\u0629 \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u062A\u062E\u0637\u064A\u0637 \u0635\u062D\u064A \u0648\u0631\u0642\u0627\u0628\u064A \u0639\u0627\u0645",
    provinceId: "all",
    provinceName: "\u0639\u0645\u0648\u0645 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 (\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A)",
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    assignedZoneId: "all_hq",
    assignedZoneName: "\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645 \u2014 \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u0640 18",
    status: "ACTIVE",
    createdAt: "2024-01-01"
  },
  {
    id: "user_deputy",
    name: "\u0623. \u062F. \u0623\u062D\u0645\u062F \u0627\u0644\u062D\u0633\u064A\u0646\u064A (\u0646\u0627\u0626\u0628 \u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A)",
    role: "HIGH_COMMAND",
    roleTitle: "\u0646\u0627\u0626\u0628 \u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A",
    badgeNumber: "NURSE-HQ-002",
    phone: "07702223311",
    email: "deputy@syndicate-nurse.iq",
    username: "deputy_president",
    password: "Deputy2026!Pass",
    nationalId: "198420192837",
    educationQualification: "\u0628\u0648\u0631\u062F \u062A\u0645\u0631\u064A\u0636 \u062A\u062E\u0635\u0635\u064A \u0648\u062F\u0643\u062A\u0648\u0631\u0627\u0647 \u0635\u062D\u0629 \u0639\u0627\u0645\u0629",
    specialization: "\u0645\u062A\u0627\u0628\u0639\u0629 \u0634\u0624\u0648\u0646 \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A \u0627\u0644\u0634\u0627\u0645\u0644",
    provinceId: "all",
    provinceName: "\u0639\u0645\u0648\u0645 \u062C\u0645\u0647\u0648\u0631\u064A\u0629 \u0627\u0644\u0639\u0631\u0627\u0642 (\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A)",
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    assignedZoneId: "all_hq",
    assignedZoneName: "\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645 \u2014 \u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0641\u0631\u0648\u0639",
    status: "ACTIVE",
    createdAt: "2024-01-15"
  },
  {
    id: "user_baghdad_hq",
    name: "\u0645. \u062D\u064A\u062F\u0631 \u0627\u0644\u0645\u0648\u0633\u0648\u064A (\u0645\u0633\u0624\u0648\u0644 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F \u0648\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645)",
    role: "BRANCH_DIRECTOR",
    roleTitle: "\u0645\u0633\u0624\u0648\u0644 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F / \u0645\u0646\u0633\u0642 \u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A",
    badgeNumber: "NURSE-BGD-HQ",
    phone: "07904445566",
    email: "baghdad.hq@syndicate-nurse.iq",
    username: "baghdad_hq_dir",
    password: "BgdHQ2026!Pass",
    nationalId: "198739102938",
    educationQualification: "\u0645\u0627\u062C\u0633\u062A\u064A\u0631 \u0639\u0644\u0648\u0645 \u062A\u0645\u0631\u064A\u0636 \u0648\u0625\u062F\u0627\u0631\u0629 \u0635\u062D\u064A\u0629",
    specialization: "\u0625\u062F\u0627\u0631\u0629 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F \u0648\u0627\u0644\u062A\u0646\u0633\u064A\u0642 \u0627\u0644\u0645\u0631\u0643\u0632\u064A \u0628\u064A\u0646 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F (\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645)",
    canBroadcastNationwide: true,
    canAccessAllProvinces: true,
    assignedZoneId: "zone_karkh",
    assignedZoneName: "\u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F + \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0648\u0635\u0648\u0644 \u0648\u0627\u0644\u062A\u0628\u0644\u064A\u063A \u0627\u0644\u0639\u0627\u0645 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A",
    status: "ACTIVE",
    createdAt: "2024-03-01"
  },
  {
    id: "user_karbala_dir",
    name: "\u0623. \u0643\u0631\u0627\u0631 \u0639\u0628\u062F \u0627\u0644\u0631\u0636\u0627 (\u0645\u0633\u0624\u0648\u0644 \u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629)",
    role: "BRANCH_DIRECTOR",
    roleTitle: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    badgeNumber: "NURSE-KRB-001",
    phone: "07804455667",
    email: "karbala.dir@syndicate-nurse.iq",
    username: "karbala_dir",
    password: "Karbala2026!Pass",
    nationalId: "198649201928",
    educationQualification: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0639\u0644\u0648\u0645 \u062A\u0645\u0631\u064A\u0636",
    specialization: "\u0625\u062F\u0627\u0631\u0629 \u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0648\u0627\u0644\u0625\u0634\u0631\u0627\u0641 \u0639\u0644\u0649 \u0627\u0644\u0644\u062C\u0627\u0646 \u0627\u0644\u0645\u062D\u0644\u064A\u0629",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_karbala_center",
    assignedZoneName: "\u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629 \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u062A\u0627\u0628\u0639\u0629 \u0644\u0647",
    status: "ACTIVE",
    createdAt: "2024-04-10"
  },
  {
    id: "user_karbala_insp",
    name: "\u0627\u0644\u0645\u0641\u062A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A / \u0633\u062C\u0627\u062F \u0643\u0627\u0638\u0645 \u0627\u0644\u0623\u0633\u062F\u064A (\u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621)",
    role: "FIELD_INSPECTOR",
    roleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    badgeNumber: "INSP-KRB-04",
    phone: "07809988776",
    email: "sajjad.karbala@syndicate-nurse.iq",
    username: "insp_sajjad_krb",
    password: "Sajjad2026#Krb",
    nationalId: "199320194829",
    educationQualification: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u0645\u0631\u064A\u0636 (\u062C\u0627\u0645\u0639\u0629 \u0643\u0631\u0628\u0644\u0627\u0621)",
    specialization: "\u062A\u0641\u062A\u064A\u0634 \u0633\u0631\u064A\u0631\u064A \u0648\u0631\u0642\u0627\u0628\u0629 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_karbala_center",
    assignedZoneName: "\u0642\u0627\u0637\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0631\u0643\u0632 \u0648\u0627\u0644\u0639\u0628\u0627\u0633\u064A\u0629 \u0648\u0627\u0644\u0625\u0635\u0644\u0627\u062D",
    status: "ACTIVE",
    createdAt: "2025-01-20"
  },
  {
    id: "user_7",
    name: "\u0627\u0644\u0645\u0641\u062A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A / \u0639\u0645\u0627\u0631 \u062C\u0627\u0633\u0645 \u0627\u0644\u0628\u0635\u0631\u064A (\u0641\u0631\u0639 \u0627\u0644\u0628\u0635\u0631\u0629)",
    role: "FIELD_INSPECTOR",
    roleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0641\u0631\u0639 \u0627\u0644\u0628\u0635\u0631\u0629",
    badgeNumber: "INSP-BSR-92",
    phone: "07801122334",
    email: "ammar.basra@syndicate-nurse.iq",
    username: "insp_ammar_basra",
    password: "Basra2026#Ammar",
    nationalId: "199029384756",
    educationQualification: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u0645\u0631\u064A\u0636 (\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0628\u0635\u0631\u0629)",
    specialization: "\u062A\u0645\u0631\u064A\u0636 \u0628\u0627\u0637\u0646\u064A \u0648\u062A\u0641\u062A\u064A\u0634 \u062C\u0648\u062F\u0629 \u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u0635\u062D\u064A\u0629",
    provinceId: "iq_basra",
    provinceName: "\u0627\u0644\u0628\u0635\u0631\u0629",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_basra_center",
    assignedZoneName: "\u0642\u0637\u0627\u0639 \u0627\u0644\u0628\u0635\u0631\u0629 \u0648\u0634\u0637 \u0627\u0644\u0639\u0631\u0628 \u0648\u0627\u0644\u0628\u0631\u0627\u0636\u0639\u064A\u0629",
    status: "ACTIVE",
    createdAt: "2025-03-01"
  },
  {
    id: "user_5",
    name: "\u0627\u0644\u0645\u0641\u062A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A / \u0639\u0644\u064A \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0639\u0628\u064A (\u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F)",
    role: "FIELD_INSPECTOR",
    roleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F (\u0627\u0644\u0643\u0631\u062E)",
    badgeNumber: "INSP-BGD-88",
    phone: "07725556677",
    email: "ali.kaabi@syndicate-nurse.iq",
    username: "insp_ali_kaabi",
    password: "AliKaabi2026#",
    nationalId: "199201928374",
    educationQualification: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u0645\u0631\u064A\u0636 (\u062C\u0627\u0645\u0639\u0629 \u0628\u063A\u062F\u0627\u062F)",
    specialization: "\u0639\u0646\u0627\u064A\u0629 \u0645\u0631\u0643\u0632\u0629 \u0648\u062A\u0636\u0645\u0627\u062F \u062C\u0631\u0627\u062D\u064A \u0648\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_karkh",
    assignedZoneName: "\u0632\u0648\u0646 1 - \u0627\u0644\u0643\u0631\u062E \u0648\u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0648\u062D\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0629",
    status: "ACTIVE",
    createdAt: "2025-01-10"
  },
  {
    id: "user_6",
    name: "\u0627\u0644\u0645\u0641\u062A\u0634\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 / \u0632\u064A\u0646\u0628 \u0641\u0627\u0636\u0644 \u0627\u0644\u0632\u0628\u064A\u062F\u064A (\u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F)",
    role: "FIELD_INSPECTOR",
    roleTitle: "\u0645\u0641\u062A\u0634\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u2014 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F (\u0627\u0644\u0631\u0635\u0627\u0641\u0629)",
    badgeNumber: "INSP-BGD-89",
    phone: "07816667788",
    email: "zainab.zubaidi@syndicate-nurse.iq",
    username: "insp_zainab",
    password: "Zainab2026#Inspector",
    nationalId: "199482910293",
    educationQualification: "\u062F\u0628\u0644\u0648\u0645 \u0639\u0627\u0644\u064A \u062A\u0645\u0631\u064A\u0636 \u0648\u0637\u0648\u0627\u0631\u0626",
    specialization: "\u0637\u0648\u0627\u0631\u0626 \u0648\u0639\u064A\u0627\u062F\u0627\u062A \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u062A\u0641\u062A\u064A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_rusafa",
    assignedZoneName: "\u0632\u0648\u0646 2 - \u0627\u0644\u0631\u0635\u0627\u0641\u0629 \u0648\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0648\u0632\u064A\u0648\u0646\u0629",
    status: "ACTIVE",
    createdAt: "2025-02-01"
  },
  {
    id: "user_najaf_insp",
    name: "\u0627\u0644\u0645\u0641\u062A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A / \u062D\u064A\u062F\u0631 \u0639\u0628\u0627\u0633 \u0627\u0644\u0646\u062C\u0641\u064A (\u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0641)",
    role: "FIELD_INSPECTOR",
    roleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0641\u0631\u0639 \u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641",
    badgeNumber: "INSP-NJF-12",
    phone: "07823344556",
    email: "haider.najaf@syndicate-nurse.iq",
    username: "insp_haider_najaf",
    password: "Najaf2026#Insp",
    nationalId: "199182938475",
    educationQualification: "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u062A\u0645\u0631\u064A\u0636 (\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0643\u0648\u0641\u0629)",
    specialization: "\u062A\u0641\u062A\u064A\u0634 \u0639\u064A\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0648\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0645\u0646\u0632\u0644\u064A\u0629",
    provinceId: "iq_najaf",
    provinceName: "\u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641",
    canBroadcastNationwide: false,
    canAccessAllProvinces: false,
    assignedZoneId: "zone_najaf_center",
    assignedZoneName: "\u0642\u0627\u0637\u0639 \u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641 \u0648\u0627\u0644\u0643\u0648\u0641\u0629",
    status: "ACTIVE",
    createdAt: "2025-02-15"
  }
];
var INITIAL_FACILITIES = [
  {
    id: "fac_bgd_1",
    licenseNumber: "LIC-2026-001",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u062E\u064A\u0631\u064A \u0644\u0644\u0623\u0645\u0631\u0627\u0636 \u0648\u0627\u0644\u062C\u0631\u0627\u062D\u0629",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u062E / \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    neighborhood: "\u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0646\u062F\u064A \u0627\u0644\u0637\u0628\u064A - \u0645\u0642\u0627\u0628\u0644 \u0645\u062C\u0645\u0639 \u0627\u0644\u0623\u0637\u0628\u0627\u0621",
    ownerName: "\u062F. \u0635\u0627\u062F\u0642 \u0627\u0644\u062C\u0628\u0648\u0631\u064A",
    ownerPhone: "07701234567",
    latitude: 33.3085,
    longitude: 44.3412,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-12-31",
    lastInspectionDate: "2026-06-15",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-01-15"
  },
  {
    id: "fac_bgd_2",
    licenseNumber: "LIC-2026-002",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0639\u0627\u0644\u0650\u0645 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0646\u0635\u0648\u0631",
    neighborhood: "\u0627\u0644\u0645\u0646\u0635\u0648\u0631",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0645\u0646\u0635\u0648\u0631 - \u0634\u0627\u0631\u0639 \u0627\u0644\u062F\u0627\u0648\u062F\u064A - \u0642\u0631\u0628 \u062A\u0642\u0627\u0637\u0639 \u0627\u0644\u0631\u0648\u0627\u062F",
    ownerName: "\u062F. \u062E\u0627\u0644\u062F \u0639\u0628\u062F \u0627\u0644\u062E\u0627\u0644\u0642 \u0627\u0644\u0645\u0646\u0635\u0648\u0631\u064A",
    ownerPhone: "07802345678",
    latitude: 33.3175,
    longitude: 44.3482,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-10-15",
    lastInspectionDate: "2026-05-10",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-02-10"
  },
  {
    id: "fac_bgd_3",
    licenseNumber: "LIC-2026-003",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0627\u0644\u062C\u0631\u0627\u062D\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0646\u0635\u0648\u0631",
    neighborhood: "\u0627\u0644\u0645\u0646\u0635\u0648\u0631",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0645\u0646\u0635\u0648\u0631 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0623\u0645\u064A\u0631\u0627\u062A - \u0639\u0645\u0627\u0631\u0629 \u0627\u0644\u0634\u0641\u0627\u0621 \u0627\u0644\u0637\u0628\u064A\u0629",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u062C\u0627\u0645\u0639\u064A / \u0637\u0627\u0631\u0642 \u0627\u0644\u0633\u0627\u0639\u062F\u064A",
    ownerPhone: "07713456789",
    latitude: 33.315,
    longitude: 44.351,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-11-20",
    lastInspectionDate: "2026-07-01",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-03-12"
  },
  {
    id: "fac_bgd_4",
    licenseNumber: "LIC-2026-004",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062A\u0627\u062C \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u062E / \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    neighborhood: "\u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0646\u062F\u064A - \u0642\u0631\u0628 \u0645\u0639\u0631\u0636 \u0628\u063A\u062F\u0627\u062F \u0627\u0644\u062F\u0648\u0644\u064A",
    ownerName: "\u062F. \u0639\u0645\u0627\u0631 \u0627\u0644\u062E\u0641\u0627\u062C\u064A",
    ownerPhone: "07904567890",
    latitude: 33.3072,
    longitude: 44.3435,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2028-01-10",
    lastInspectionDate: "2026-04-18",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-06-01"
  },
  {
    id: "fac_bgd_5",
    licenseNumber: "LIC-2026-005",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0646\u062C\u0627\u0629 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u064A\u0631\u0645\u0648\u0643",
    neighborhood: "\u0627\u0644\u064A\u0631\u0645\u0648\u0643",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u064A\u0631\u0645\u0648\u0643 - \u0627\u0644\u0634\u0627\u0631\u0639 \u0627\u0644\u0639\u0627\u0645 - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0623\u0645 \u0627\u0644\u0637\u0628\u0648\u0644",
    ownerName: "\u062F. \u0628\u0627\u0633\u0645 \u0627\u0644\u062A\u0645\u064A\u0645\u064A",
    ownerPhone: "07705678901",
    latitude: 33.2921,
    longitude: 44.3318,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-08-05",
    lastInspectionDate: "2026-03-22",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-09-15"
  },
  {
    id: "fac_bgd_6",
    licenseNumber: "LIC-2026-006",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0641\u0631\u0627\u062A \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    neighborhood: "\u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0633\u0627\u062D\u0629 \u0627\u0644\u0632\u0647\u0631\u0627\u0621 - \u0642\u0631\u0628 \u0627\u0644\u0645\u0631\u0642\u062F \u0627\u0644\u0634\u0631\u064A\u0641",
    ownerName: "\u062F. \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0627\u0638\u0645\u064A",
    ownerPhone: "07806789012",
    latitude: 33.3852,
    longitude: 44.348,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-05-30",
    lastInspectionDate: "2026-06-10",
    inspectionStatus: "INSPECTED",
    createdDate: "2023-11-20"
  },
  {
    id: "fac_bgd_7",
    licenseNumber: "LIC-2026-007",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629 \u0627\u0644\u062A\u062E\u0635\u0635\u064A\u0629 \u0648\u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u062E / \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    neighborhood: "\u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u062D\u0627\u0631\u062B\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0646\u062F\u064A - \u0645\u062C\u0645\u0639 \u0627\u0644\u0645\u062F\u0649 \u0627\u0644\u0637\u0628\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u062C\u0627\u0645\u0639\u064A / \u0639\u0644\u0627\u0621 \u0627\u0644\u0628\u063A\u062F\u0627\u062F\u064A",
    ownerPhone: "07717890123",
    latitude: 33.309,
    longitude: 44.342,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-12-15",
    lastInspectionDate: "2026-05-04",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-01-10"
  },
  {
    id: "fac_bgd_8",
    licenseNumber: "LIC-2026-008",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0631\u0627\u0647\u0628\u0627\u062A \u0627\u0644\u0623\u0647\u0644\u064A (\u0627\u0644\u0642\u062F\u064A\u0633 \u0631\u0627\u0641\u0627\u0626\u064A\u0644)",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u0627\u062F\u0629",
    neighborhood: "\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0631\u0627\u062F\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0646\u0636\u0627\u0644 - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0627\u0644\u0623\u0646\u062F\u0644\u0633",
    ownerName: "\u062F. \u0641\u0627\u062F\u064A \u0625\u0646\u0633\u0627\u0646\u064A\u0627\u0646",
    ownerPhone: "07908901234",
    latitude: 33.3182,
    longitude: 44.4125,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2028-03-01",
    lastInspectionDate: "2026-06-25",
    inspectionStatus: "INSPECTED",
    createdDate: "2023-04-10"
  },
  {
    id: "fac_bgd_9",
    licenseNumber: "LIC-2026-009",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u0627\u062F\u0629 / \u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629",
    neighborhood: "\u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629 - \u0627\u0644\u0634\u0627\u0631\u0639 \u0627\u0644\u0639\u0627\u0645 - \u0642\u0631\u0628 \u062C\u0627\u0645\u0639\u0629 \u0628\u063A\u062F\u0627\u062F \u0648\u062C\u0633\u0631 \u0627\u0644\u062C\u0627\u062F\u0631\u064A\u0629",
    ownerName: "\u062F. \u0631\u064A\u0627\u0636 \u0639\u0628\u062F \u0627\u0644\u0644\u0647 \u0627\u0644\u0632\u0628\u064A\u062F\u064A",
    ownerPhone: "07709012345",
    latitude: 33.2798,
    longitude: 44.3821,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-09-18",
    lastInspectionDate: "2026-04-14",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-02-18"
  },
  {
    id: "fac_bgd_10",
    licenseNumber: "LIC-2026-010",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0642\u0645\u0629 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629",
    neighborhood: "\u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0623\u0637\u0628\u0627\u0621 - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0639\u0646\u062A\u0631",
    ownerName: "\u062F. \u0639\u0645\u0631 \u0637\u0627\u0631\u0642 \u0627\u0644\u0623\u0639\u0638\u0645\u064A",
    ownerPhone: "07800123456",
    latitude: 33.3725,
    longitude: 44.361,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-11-12",
    lastInspectionDate: "2026-05-20",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-08-05"
  },
  {
    id: "fac_bgd_11",
    licenseNumber: "LIC-2026-011",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0628\u063A\u062F\u0627\u062F \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u0627\u062F\u0629",
    neighborhood: "\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0631\u0627\u062F\u0629 - \u0634\u0627\u0631\u0639 52 - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0627\u0644\u0648\u0627\u062B\u0642",
    ownerName: "\u062F. \u0647\u064A\u062B\u0645 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    ownerPhone: "07711234567",
    latitude: 33.3102,
    longitude: 44.4255,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2028-02-28",
    lastInspectionDate: "2026-06-02",
    inspectionStatus: "INSPECTED",
    createdDate: "2023-12-10"
  },
  {
    id: "fac_bgd_12",
    licenseNumber: "LIC-2026-012",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0647\u0644\u0627\u0644 \u0627\u0644\u0623\u062D\u0645\u0631 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0635\u0627\u0641\u0629 / \u0632\u064A\u0648\u0646\u0629",
    neighborhood: "\u0632\u064A\u0648\u0646\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0632\u064A\u0648\u0646\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0631\u0628\u064A\u0639\u064A - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0645\u064A\u0633\u0644\u0648\u0646",
    ownerName: "\u062F. \u0646\u0627\u062F\u064A\u0629 \u0627\u0644\u0639\u0628\u064A\u062F\u064A",
    ownerPhone: "07902345678",
    latitude: 33.3245,
    longitude: 44.441,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-07-22",
    lastInspectionDate: "2026-03-30",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-05-25"
  },
  {
    id: "fac_bgd_13",
    licenseNumber: "LIC-2026-013",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0636\u0645\u0627\u062F \u0627\u0644\u0633\u0631\u064A\u0639",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629",
    neighborhood: "\u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0623\u0639\u0638\u0645\u064A\u0629 - \u0634\u0627\u0631\u0639 \u0639\u0645\u0631 \u0628\u0646 \u0639\u0628\u062F \u0627\u0644\u0639\u0632\u064A\u0632 - \u0642\u0631\u0628 \u0631\u0623\u0633 \u0627\u0644\u062D\u0648\u0627\u0634",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 / \u0647\u0634\u0627\u0645 \u0627\u0644\u0642\u064A\u0633\u064A",
    ownerPhone: "07703456789",
    latitude: 33.378,
    longitude: 44.3642,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-10-10",
    lastInspectionDate: "2026-06-18",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-04-15"
  },
  {
    id: "fac_bgd_14",
    licenseNumber: "LIC-2026-014",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0634\u0631\u0642 \u0627\u0644\u0623\u0648\u0633\u0637 \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u0627\u062F\u0629",
    neighborhood: "\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u062E\u0627\u0631\u062C - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u0627\u0644\u062D\u0631\u064A\u0629",
    ownerName: "\u062F. \u0645\u0627\u0632\u0646 \u0627\u0644\u0631\u0628\u064A\u0639\u064A",
    ownerPhone: "07804567890",
    latitude: 33.2985,
    longitude: 44.428,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-06-14",
    lastInspectionDate: "2026-02-20",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-07-11"
  },
  {
    id: "fac_bgd_15",
    licenseNumber: "LIC-2026-015",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0635\u0627\u0641\u0629 / \u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646",
    neighborhood: "\u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646",
    addressDetail: "\u0628\u063A\u062F\u0627\u062F - \u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646 - \u0642\u0631\u0628 \u0627\u0644\u0646\u0627\u062F\u064A \u0627\u0644\u0639\u0631\u0628\u064A \u0648\u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u0635\u0631\u064A\u0629",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u062C\u0627\u0645\u0639\u064A / \u0623\u062D\u0645\u062F \u0627\u0644\u0645\u062D\u0645\u062F\u0627\u0648\u064A",
    ownerPhone: "07715678901",
    latitude: 33.345,
    longitude: 44.419,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-09-30",
    lastInspectionDate: "2026-05-15",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-05-01"
  },
  {
    id: "fac_3",
    licenseNumber: "IRQ-NUR-2023-089",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0634\u0641\u0627\u0621 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A",
    type: "HOSPITAL",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0635\u0627\u0641\u0629",
    neighborhood: "\u0632\u064A\u0648\u0646\u0629",
    addressDetail: "\u0642\u0631\u0628 \u0627\u0644\u0634\u0627\u0631\u0639 \u0627\u0644\u062E\u062F\u0645\u064A \u0644\u0644\u0642\u0646\u0627\u0629 - \u0645\u0642\u0627\u0628\u0644 \u0646\u0627\u062F\u064A \u0627\u0644\u0636\u0628\u0627\u0637",
    ownerName: "\u062F. \u0646\u0627\u062F\u064A\u0629 \u0627\u0644\u0639\u0628\u064A\u062F\u064A",
    ownerPhone: "07712223344",
    latitude: 33.328,
    longitude: 44.432,
    licenseStatus: "EXPIRED",
    licenseExpiryDate: "2025-12-01",
    lastInspectionDate: "2025-11-01",
    inspectionStatus: "NEEDS_INSPECTION",
    createdDate: "2023-05-20"
  },
  {
    id: "fac_4",
    licenseNumber: "IRQ-NUR-2025-312",
    name: "\u0645\u0631\u0643\u0632 \u062F\u062C\u0644\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0644\u0631\u0639\u0627\u064A\u0629 \u0643\u0628\u0627\u0631 \u0627\u0644\u0633\u0646 \u0648\u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A",
    type: "NURSING_CENTER",
    provinceId: "iq_baghdad",
    zoneId: "zone_rusafa",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u0627\u062F\u0629",
    neighborhood: "\u0627\u0644\u0643\u0631\u0627\u062F\u0629 \u0627\u0644\u0634\u0631\u0642\u064A\u0629",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0639\u0631\u0635\u0627\u062A - \u0642\u0631\u0628 \u0627\u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u0637\u0628\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0623\u062E\u0635\u0627\u0626\u064A / \u0643\u0645\u0627\u0644 \u0646\u0648\u0631\u064A",
    ownerPhone: "07903334455",
    latitude: 33.3012,
    longitude: 44.418,
    licenseStatus: "PENDING",
    licenseExpiryDate: "2026-09-02",
    inspectionStatus: "NEEDS_INSPECTION",
    createdDate: "2025-08-01"
  },
  {
    id: "fac_5",
    licenseNumber: "IRQ-NUR-2026-005",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    neighborhood: "\u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0623\u0643\u062F - \u0642\u0631\u0628 \u0628\u0627\u0628 \u0627\u0644\u062F\u0631\u0648\u0627\u0632\u0629",
    ownerName: "\u062D\u0633\u0646 \u0639\u0628\u062F \u0627\u0644\u0632\u0647\u0631\u0629",
    ownerPhone: "07705556677",
    latitude: 33.382,
    longitude: 44.349,
    licenseStatus: "UNLICENSED",
    licenseExpiryDate: "2024-01-01",
    lastInspectionDate: "2026-07-20",
    inspectionStatus: "VIOLATION_RECORDED",
    createdDate: "2026-01-10"
  },
  {
    id: "fac_6",
    licenseNumber: "IRQ-NUR-2024-411",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0628\u0635\u0631\u0629 \u0627\u0644\u062F\u0648\u0644\u064A \u0627\u0644\u0623\u0647\u0644\u064A",
    type: "HOSPITAL",
    provinceId: "iq_basra",
    zoneId: "zone_basra_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0628\u0635\u0631\u0629 \u0627\u0644\u0645\u0631\u0643\u0632",
    neighborhood: "\u0627\u0644\u0628\u0631\u0627\u0636\u0639\u064A\u0629",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0643\u0648\u0631\u0646\u064A\u0634 \u0634\u0637 \u0627\u0644\u0639\u0631\u0628",
    ownerName: "\u062F. \u0639\u0645\u0627\u062F \u0627\u0644\u062D\u0633\u0627\u0646",
    ownerPhone: "07801112299",
    latitude: 30.51,
    longitude: 47.85,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-05-30",
    lastInspectionDate: "2026-04-12",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-03-01"
  },
  {
    id: "fac_7",
    licenseNumber: "IRQ-NUR-2025-502",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062D\u062F\u0628\u0627\u0621 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    type: "HOSPITAL",
    provinceId: "iq_nineveh",
    zoneId: "zone_nineveh_mosul_left",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0648\u0635\u0644 (\u0627\u0644\u062C\u0627\u0646\u0628 \u0627\u0644\u0623\u064A\u0633\u0631)",
    neighborhood: "\u0627\u0644\u0645\u062C\u0645\u0648\u0639\u0629 \u0627\u0644\u062B\u0642\u0627\u0641\u064A\u0629",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0627\u0644\u062C\u0627\u0645\u0639\u0629 - \u0642\u0631\u0628 \u0627\u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u0637\u0628\u064A",
    ownerName: "\u062F. \u064A\u0648\u0646\u0633 \u0627\u0644\u062D\u0645\u062F\u0627\u0646\u064A",
    ownerPhone: "07703332211",
    latitude: 36.355,
    longitude: 43.152,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-09-20",
    lastInspectionDate: "2026-05-18",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-01-12"
  },
  {
    id: "fac_8",
    licenseNumber: "IRQ-NUR-2024-601",
    name: "\u0645\u0631\u0643\u0632 \u0639\u064A\u0646\u0643\u0627\u0648\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    type: "NURSING_CENTER",
    provinceId: "iq_erbil",
    zoneId: "zone_erbil_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0639\u064A\u0646\u0643\u0627\u0648\u0629",
    neighborhood: "\u0646\u0627\u062D\u064A\u0629 \u0639\u064A\u0646\u0643\u0627\u0648\u0629",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0646\u064A\u0633\u0629 \u0627\u0644\u0631\u0626\u064A\u0633\u064A\u0629 - \u0642\u0631\u0628 \u0627\u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u062E\u062F\u0645\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u0623\u062E\u0635\u0627\u0626\u064A / \u062F\u0627\u0646\u064A\u0627\u0644 \u064A\u0648\u0633\u0641",
    ownerPhone: "07501114422",
    latitude: 36.22,
    longitude: 43.99,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2028-01-10",
    lastInspectionDate: "2026-06-01",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-04-05"
  },
  {
    id: "fac_9",
    licenseNumber: "IRQ-NUR-2025-710",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0633\u0631\u062C\u0646\u0627\u0631 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A",
    type: "CLINIC",
    provinceId: "iq_sulaymaniyah",
    zoneId: "zone_suly_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0633\u0644\u064A\u0645\u0627\u0646\u064A\u0629 / \u0633\u0631\u062C\u0646\u0627\u0631",
    neighborhood: "\u0645\u0646\u0637\u0642\u0629 \u0633\u0631\u062C\u0646\u0627\u0631",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0633\u0631\u062C\u0646\u0627\u0631 \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636\u0629 / \u0622\u0634\u062A\u064A \u0643\u0648\u0631\u0627\u0646",
    ownerPhone: "07709991122",
    latitude: 35.56,
    longitude: 45.42,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-04-15",
    lastInspectionDate: "2026-03-22",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-03-10"
  },
  {
    id: "fac_10",
    licenseNumber: "IRQ-NUR-2024-880",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u063A\u0631\u064A \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A",
    type: "HOSPITAL",
    provinceId: "iq_najaf",
    zoneId: "zone_najaf_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641",
    neighborhood: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0643\u0648\u0641\u0629",
    addressDetail: "\u0645\u0642\u0627\u0628\u0644 \u0645\u062C\u0645\u0639 \u0627\u0644\u0623\u0637\u0628\u0627\u0621 - \u0642\u0631\u0628 \u0633\u0627\u062D\u0629 \u062B\u0648\u0631\u0629 \u0627\u0644\u0639\u0634\u0631\u064A\u0646",
    ownerName: "\u062F. \u0639\u0644\u064A \u0627\u0644\u0645\u0638\u0641\u0631",
    ownerPhone: "07803332211",
    latitude: 32.01,
    longitude: 44.34,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-11-30",
    lastInspectionDate: "2026-07-02",
    inspectionStatus: "INSPECTED",
    createdDate: "2024-08-15"
  },
  {
    id: "fac_11",
    licenseNumber: "IRQ-NUR-2025-911",
    name: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0633\u062F\u0631\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0644\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0641\u0627\u0626\u0642\u0629",
    type: "NURSING_CENTER",
    provinceId: "iq_karbala",
    zoneId: "zone_karbala_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    neighborhood: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0633\u062F\u0631\u0629",
    addressDetail: "\u0642\u0631\u0628 \u0628\u0627\u0628 \u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u0637\u0628\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u062C\u0627\u0645\u0639\u064A / \u062D\u0633\u064A\u0646 \u0627\u0644\u062E\u0641\u0627\u062C\u064A",
    ownerPhone: "07812223344",
    latitude: 32.618,
    longitude: 44.028,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-10-10",
    lastInspectionDate: "2026-06-25",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-05-14"
  },
  {
    id: "fac_12",
    licenseNumber: "IRQ-NUR-2026-102",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u062D\u0644\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0636\u0645\u0627\u062F \u0627\u0644\u0645\u062A\u0642\u062F\u0645",
    type: "CLINIC",
    provinceId: "iq_babel",
    zoneId: "zone_babil_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u062D\u0644\u0629",
    neighborhood: "\u0634\u0627\u0631\u0639 40",
    addressDetail: "\u0645\u0642\u0627\u0628\u0644 \u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u062D\u0644\u0629 \u0627\u0644\u062A\u0639\u0644\u064A\u0645\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 / \u0639\u0645\u0627\u0631 \u0627\u0644\u0628\u0627\u0628\u0644\u064A",
    ownerPhone: "07804445566",
    latitude: 32.468,
    longitude: 44.435,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-02-28",
    lastInspectionDate: "2026-05-02",
    inspectionStatus: "INSPECTED",
    createdDate: "2026-01-20"
  },
  {
    id: "fac_13",
    licenseNumber: "IRQ-NUR-2025-333",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0643\u0631\u0643\u0648\u0643 \u0627\u0644\u0623\u0647\u0644\u064A \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    type: "HOSPITAL",
    provinceId: "iq_kirkuk",
    zoneId: "zone_kirkuk_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0643\u0631\u0643\u0648\u0643 \u0627\u0644\u0645\u0631\u0643\u0632",
    neighborhood: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0642\u062F\u0633",
    addressDetail: "\u0642\u0631\u0628 \u0645\u0628\u0646\u0649 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0629 \u0627\u0644\u0642\u062F\u064A\u0645",
    ownerName: "\u062F. \u0623\u0631\u0627\u0633 \u0627\u0644\u0628\u064A\u0627\u062A\u064A",
    ownerPhone: "07701115566",
    latitude: 35.47,
    longitude: 44.395,
    licenseStatus: "EXPIRED",
    licenseExpiryDate: "2025-11-15",
    lastInspectionDate: "2025-10-10",
    inspectionStatus: "NEEDS_INSPECTION",
    createdDate: "2025-03-01"
  },
  {
    id: "fac_14",
    licenseNumber: "IRQ-NUR-2026-404",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0631\u0645\u0627\u062F\u064A \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0637\u0648\u0627\u0631\u0626",
    type: "CLINIC",
    provinceId: "iq_anbar",
    zoneId: "zone_anbar_ramadi",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0631\u0645\u0627\u062F\u064A",
    neighborhood: "\u0645\u062F\u064A\u0646\u0629 \u0627\u0644\u0631\u0645\u0627\u062F\u064A",
    addressDetail: "\u0634\u0627\u0631\u0639 17 - \u0627\u0644\u0645\u062C\u0645\u0639 \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0631\u0626\u064A\u0633\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 / \u0623\u062D\u0645\u062F \u0627\u0644\u062F\u0644\u064A\u0645\u064A",
    ownerPhone: "07807778899",
    latitude: 33.425,
    longitude: 43.3,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-07-20",
    lastInspectionDate: "2026-06-18",
    inspectionStatus: "INSPECTED",
    createdDate: "2026-02-15"
  },
  {
    id: "fac_15",
    licenseNumber: "IRQ-NUR-2025-515",
    name: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0646\u0627\u0635\u0631\u064A\u0629 \u0627\u0644\u0623\u0647\u0644\u064A \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0648\u0627\u0644\u062C\u0631\u0627\u062D\u0629",
    type: "HOSPITAL",
    provinceId: "iq_dhi_qar",
    zoneId: "zone_dhiqar_nasiriya",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0646\u0627\u0635\u0631\u064A\u0629",
    neighborhood: "\u062D\u064A \u0627\u0644\u0635\u0627\u0644\u062D\u064A\u0629",
    addressDetail: "\u0642\u0631\u0628 \u062C\u0633\u0631 \u0627\u0644\u062D\u0636\u0627\u0631\u0627\u062A - \u0627\u0644\u0634\u0627\u0631\u0639 \u0627\u0644\u0639\u0627\u0645",
    ownerName: "\u062F. \u062D\u064A\u062F\u0631 \u0627\u0644\u0631\u0643\u0627\u0628\u064A",
    ownerPhone: "07819998811",
    latitude: 31.06,
    longitude: 46.26,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2027-12-01",
    lastInspectionDate: "2026-05-30",
    inspectionStatus: "INSPECTED",
    createdDate: "2025-06-20"
  },
  {
    id: "fac_16",
    licenseNumber: "IRQ-NUR-2025-616",
    name: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0643\u0631\u062E \u0627\u0644\u062A\u062E\u0635\u0635\u064A\u0629 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    type: "CLINIC",
    provinceId: "iq_baghdad",
    zoneId: "zone_karkh",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0643\u0631\u062E / \u0627\u0644\u0628\u064A\u0627\u062A",
    neighborhood: "\u0627\u0644\u0628\u064A\u0627\u0639",
    addressDetail: "\u0634\u0627\u0631\u0639 20 - \u0642\u0631\u0628 \u0645\u062C\u0645\u0639 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u062C\u0627\u0645\u0639\u064A / \u0633\u0644\u0627\u0645 \u0645\u062C\u064A\u062F \u0627\u0644\u0645\u062D\u0645\u062F\u0627\u0648\u064A",
    ownerPhone: "07704443322",
    latitude: 33.285,
    longitude: 44.328,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-08-20",
    lastInspectionDate: "2026-04-10",
    inspectionStatus: "NEEDS_INSPECTION",
    createdDate: "2025-04-01"
  },
  {
    id: "fac_17",
    licenseNumber: "IRQ-NUR-2025-717",
    name: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0639\u0634\u0627\u0631 \u0644\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0627\u0644\u0641\u0627\u0626\u0642\u0629",
    type: "CLINIC",
    provinceId: "iq_basra",
    zoneId: "zone_basra_center",
    districtArea: "\u0642\u0636\u0627\u0621 \u0627\u0644\u0628\u0635\u0631\u0629 / \u0627\u0644\u0639\u0634\u0627\u0631",
    neighborhood: "\u0627\u0644\u0639\u0634\u0627\u0631",
    addressDetail: "\u0634\u0627\u0631\u0639 \u0627\u0644\u0648\u0637\u0646\u064A - \u0645\u0642\u0627\u0628\u0644 \u0645\u062C\u0645\u0639 \u0627\u0644\u0635\u064A\u062F\u0644\u064A\u0627\u062A",
    ownerName: "\u0627\u0644\u0645\u0645\u0631\u0636\u0629 \u0623\u062E\u0635\u0627\u0626\u064A\u0629 / \u0645\u0631\u0648\u0629 \u0639\u0628\u062F \u0627\u0644\u0631\u0636\u0627",
    ownerPhone: "07801122334",
    latitude: 30.509,
    longitude: 47.82,
    licenseStatus: "LICENSED",
    licenseExpiryDate: "2026-09-08",
    lastInspectionDate: "2026-05-15",
    inspectionStatus: "NEEDS_INSPECTION",
    createdDate: "2025-05-10"
  }
];
var INITIAL_NURSES = [
  {
    id: "nurse_101",
    syndicateId: "NR-BAG-2021-8841",
    fullName: "\u0639\u0645\u0631 \u062E\u0627\u0644\u062F \u062E\u0644\u064A\u0644 \u0627\u0644\u0639\u0628\u064A\u062F\u064A",
    nationalId: "199284710293",
    specializedTitle: "\u0645\u0645\u0631\u0636 \u062C\u0627\u0645\u0639\u064A \u0623\u062E\u0635\u0627\u0626\u064A \u0639\u0646\u0627\u064A\u0629 \u0645\u0631\u0643\u0632\u0629",
    qualificationDegree: "\u0643\u0644\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 (\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633)",
    qualificationName: "\u062C\u0627\u0645\u0639\u0629 \u0628\u063A\u062F\u0627\u062F - \u0643\u0644\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636",
    graduationYear: 2017,
    syndicateRegistrationYear: 2018,
    bloodType: "O+",
    syndicateStatus: "ACTIVE",
    licenseExpiryDate: "2027-08-30",
    currentFacilityId: "fac_1",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0641\u0631\u0627\u062A \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    phone: "07701234567"
  },
  {
    id: "nurse_102",
    syndicateId: "NR-BAG-2020-5512",
    fullName: "\u062F\u0639\u0627\u0621 \u0645\u0631\u062A\u0636\u0649 \u0643\u0627\u0638\u0645 \u0627\u0644\u0634\u0645\u0631\u064A",
    nationalId: "199573820194",
    specializedTitle: "\u0645\u0645\u0631\u0636\u0629 \u0645\u0627\u0647\u0631\u0629 - \u062A\u062E\u062F\u064A\u0631 \u0648\u062C\u0631\u0627\u062D\u0629",
    qualificationDegree: "\u0627\u0644\u0645\u0639\u0647\u062F \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0641\u0646\u064A (\u062F\u0628\u0644\u0648\u0645 \u0639\u0627\u0644\u064A)",
    qualificationName: "\u0627\u0644\u0645\u0639\u0647\u062F \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0641\u0646\u064A - \u0627\u0644\u0643\u0631\u062E (\u0627\u0644\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u062A\u0642\u0646\u064A\u0629 \u0627\u0644\u0648\u0633\u0637\u0649)",
    graduationYear: 2018,
    syndicateRegistrationYear: 2019,
    bloodType: "A+",
    syndicateStatus: "ACTIVE",
    licenseExpiryDate: "2026-10-15",
    currentFacilityId: "fac_1",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0641\u0631\u0627\u062A \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u062E\u0635\u0635\u064A",
    phone: "07802345678"
  },
  {
    id: "nurse_103",
    syndicateId: "NR-BAG-2018-1092",
    fullName: "\u0637\u0627\u0631\u0642 \u0627\u0644\u0633\u0627\u0639\u062F\u064A",
    nationalId: "198829401923",
    specializedTitle: "\u0645\u0645\u0631\u0636 \u062C\u0627\u0645\u0639\u064A \u0645\u062C\u0627\u0632 \u0631\u0633\u0645\u064A",
    qualificationDegree: "\u0643\u0644\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 (\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633)",
    qualificationName: "\u062C\u0627\u0645\u0639\u0629 \u0627\u0644\u0645\u0633\u062A\u0646\u0635\u0631\u064A\u0629 - \u0643\u0644\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636",
    graduationYear: 2013,
    syndicateRegistrationYear: 2014,
    bloodType: "B+",
    syndicateStatus: "ACTIVE",
    licenseExpiryDate: "2027-01-01",
    currentFacilityId: "fac_2",
    facilityName: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    phone: "07809990011"
  },
  {
    id: "nurse_104",
    syndicateId: "NR-BAG-2019-3321",
    fullName: "\u0648\u0633\u0627\u0645 \u0639\u0628\u062F \u0627\u0644\u0631\u0633\u0648\u0644 \u0627\u0644\u0632\u0627\u0645\u0644\u064A",
    nationalId: "199018273645",
    specializedTitle: "\u062F\u0628\u0644\u0648\u0645 \u062A\u0645\u0631\u064A\u0636 - \u0636\u0645\u0627\u062F \u0648\u0637\u0648\u0627\u0631\u0626",
    qualificationDegree: "\u0625\u0639\u062F\u0627\u062F\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0644\u0644\u0628\u0646\u064A\u0646",
    qualificationName: "\u0625\u0639\u062F\u0627\u062F\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629 - \u0627\u0644\u0631\u0635\u0627\u0641\u0629",
    graduationYear: 2015,
    syndicateRegistrationYear: 2016,
    bloodType: "AB+",
    syndicateStatus: "EXPIRED",
    licenseExpiryDate: "2025-06-01",
    currentFacilityId: "fac_3",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0634\u0641\u0627\u0621 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A",
    phone: "07719998877",
    notes: "\u062A\u062D\u0630\u064A\u0631: \u0647\u0648\u064A\u0629 \u0627\u0644\u0627\u0646\u062A\u0633\u0627\u0628 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0646\u0630 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0633\u0646\u0629 \u0648\u0644\u0645 \u064A\u0642\u0645 \u0628\u0627\u0644\u062A\u062C\u062F\u064A\u062F"
  },
  {
    id: "nurse_105",
    syndicateId: "NR-BAG-2023-9901",
    fullName: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u0648\u062F \u062C\u0627\u0633\u0645 \u0627\u0644\u062E\u0632\u0631\u062C\u064A",
    nationalId: "199847382910",
    specializedTitle: "\u0645\u0645\u0631\u0636 \u0645\u062A\u062F\u0631\u0628 (\u062A\u062D\u062A \u0627\u0644\u0625\u0634\u0631\u0627\u0641)",
    qualificationDegree: "\u0627\u0644\u0645\u0639\u0647\u062F \u0627\u0644\u0637\u0628\u064A \u0627\u0644\u0641\u0646\u064A (\u062F\u0628\u0644\u0648\u0645)",
    qualificationName: "\u0645\u0639\u0647\u062F \u0627\u0644\u062A\u0643\u0646\u0648\u0644\u0648\u062C\u064A\u0627 \u0627\u0644\u0637\u0628\u064A - \u0627\u0644\u0645\u0646\u0635\u0648\u0631",
    graduationYear: 2022,
    syndicateRegistrationYear: 2023,
    bloodType: "O-",
    syndicateStatus: "SUSPENDED",
    licenseExpiryDate: "2024-11-15",
    currentFacilityId: "fac_5",
    facilityName: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629",
    phone: "07702221100",
    notes: "\u0645\u0648\u0642\u0648\u0641 \u0628\u0633\u0628\u0628 \u0634\u0643\u0648\u0649 \u062A\u0642\u062F\u064A\u0645 \u062E\u062F\u0645\u0627\u062A \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0628\u062F\u0648\u0646 \u0625\u0634\u0631\u0627\u0641 \u0637\u0628\u064A\u0628"
  }
];
var INITIAL_ASSIGNMENTS = [
  {
    id: "assign_1",
    assignmentCode: "INSP-2026-0801",
    facilityId: "fac_2",
    facilityName: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0645\u0646\u0635\u0648\u0631 \u0644\u0644\u062E\u062F\u0645\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0636\u0645\u0627\u062F \u0627\u0644\u0645\u062A\u0642\u062F\u0645",
    facilityAddress: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0645\u0646\u0635\u0648\u0631 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0623\u0645\u064A\u0631\u0627\u062A",
    facilityLat: 33.315,
    facilityLng: 44.351,
    assignedInspectorId: "user_5",
    assignedInspectorName: "\u0639\u0644\u064A \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0639\u0628\u064A",
    assignedByUserId: "user_4",
    assignedByUserName: "\u0645. \u062D\u064A\u062F\u0631 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    scheduledDate: "2026-08-15",
    priority: "HIGH",
    status: "PENDING",
    notes: "\u0645\u0631\u0627\u062C\u0639\u0629 \u062A\u0631\u0627\u062E\u064A\u0635 \u0627\u0644\u0636\u0645\u0627\u062F \u0648\u0641\u062D\u0635 \u0633\u062C\u0644 \u0627\u0644\u0643\u0648\u0627\u062F\u0631 \u0648\u062A\u062F\u0642\u064A\u0642 \u0623\u0643\u064A\u0627\u0633 \u0627\u0644\u0646\u0641\u0627\u064A\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629",
    createdAt: "2026-08-12"
  },
  {
    id: "assign_2",
    assignmentCode: "INSP-2026-0802",
    facilityId: "fac_3",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0634\u0641\u0627\u0621 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A",
    facilityAddress: "\u0628\u063A\u062F\u0627\u062F - \u0632\u064A\u0648\u0646\u0629 - \u0645\u0642\u0627\u0628\u0644 \u0646\u0627\u062F\u064A \u0627\u0644\u0636\u0628\u0627\u0637",
    facilityLat: 33.328,
    facilityLng: 44.432,
    assignedInspectorId: "user_6",
    assignedInspectorName: "\u0632\u064A\u0646\u0628 \u0641\u0627\u0636\u0644 \u0627\u0644\u0632\u0628\u064A\u062F\u064A",
    assignedByUserId: "user_4",
    assignedByUserName: "\u0645. \u062D\u064A\u062F\u0631 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    scheduledDate: "2026-08-14",
    priority: "URGENT",
    status: "IN_PROGRESS",
    notes: "\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0645\u0633\u062A\u0634\u0641\u0649 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0639 \u0648\u0631\u0648\u062F \u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0639\u0646 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u0627\u062F\u0631 \u063A\u064A\u0631 \u0646\u0642\u0627\u0628\u064A\u0629",
    createdAt: "2026-08-10"
  },
  {
    id: "assign_3",
    assignmentCode: "INSP-2026-0803",
    facilityId: "fac_4",
    facilityName: "\u0645\u0631\u0643\u0632 \u062F\u062C\u0644\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0644\u0631\u0639\u0627\u064A\u0629 \u0643\u0628\u0627\u0631 \u0627\u0644\u0633\u0646 \u0648\u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A",
    facilityAddress: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0631\u0627\u062F\u0629 - \u0634\u0627\u0631\u0639 \u0627\u0644\u0639\u0631\u0635\u0627\u062A",
    facilityLat: 33.3012,
    facilityLng: 44.418,
    assignedInspectorId: "user_6",
    assignedInspectorName: "\u0632\u064A\u0646\u0628 \u0641\u0627\u0636\u0644 \u0627\u0644\u0632\u0628\u064A\u062F\u064A",
    assignedByUserId: "user_3",
    assignedByUserName: "\u0623. \u0645\u0631\u0648\u0629 \u0627\u0644\u062E\u0641\u0627\u062C\u064A",
    scheduledDate: "2026-08-18",
    priority: "MEDIUM",
    status: "PENDING",
    notes: "\u0643\u0634\u0641 \u0623\u0648\u0644\u064A \u0644\u0645\u0646\u062D \u0627\u0644\u062A\u0631\u062E\u064A\u0635 \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0645\u0631\u0643\u0632 \u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    createdAt: "2026-08-11"
  }
];
var INITIAL_VIOLATIONS = [
  {
    id: "viol_1",
    inspectionReportId: "rep_100",
    facilityId: "fac_5",
    facilityName: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0643\u0627\u0638\u0645\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0627\u0644\u0633\u0631\u064A\u0639\u0629",
    violationType: "UNLICENSED_STAFF",
    description: "\u062A\u0634\u063A\u064A\u0644 \u0623\u0634\u062E\u0627\u0635 \u063A\u064A\u0631 \u062A\u0645\u0631\u064A\u0636\u064A\u0651\u064A\u0646 (\u0634\u0647\u0627\u062F\u0627\u062A \u063A\u064A\u0631 \u0637\u0628\u064A\u0629) \u0641\u064A \u0625\u062C\u0631\u0627\u0621 \u0632\u0631\u0642 \u0627\u0644\u0625\u0628\u0631 \u0648\u0627\u0644\u0645\u063A\u0630\u064A\u0627\u062A \u0627\u0644\u0648\u0631\u064A\u062F\u064A\u0629.",
    severity: "TEMPORARY_CLOSURE",
    fineAmountIqd: 25e5,
    status: "APPROVED",
    recordedAt: "2026-07-20 11:30:00"
  },
  {
    id: "viol_2",
    inspectionReportId: "rep_101",
    facilityId: "fac_3",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0634\u0641\u0627\u0621 \u0627\u0644\u0623\u0647\u0644\u064A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A",
    violationType: "EXPIRED_SYNDICATE_CARD",
    nurseSyndicateId: "NR-BAG-2019-3321",
    nurseName: "\u0648\u0633\u0627\u0645 \u0639\u0628\u062F \u0627\u0644\u0631\u0633\u0648\u0644 \u0627\u0644\u0632\u0627\u0645\u0644\u064A",
    description: "\u0639\u0645\u0644 \u0627\u0644\u0645\u0645\u0631\u0636 \u0628\u0647\u0648\u064A\u0629 \u0646\u0642\u0627\u0628\u064A\u0629 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0645\u0646\u0630 \u0623\u0643\u062B\u0631 \u0645\u0646 \u0639\u0627\u0645 \u0645\u0639 \u0627\u0644\u0627\u0645\u062A\u0646\u0627\u0639 \u0639\u0646 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0627\u0634\u062A\u0631\u0627\u0643.",
    severity: "FINE",
    fineAmountIqd: 5e5,
    status: "PENDING_REVIEW",
    recordedAt: "2026-08-05 14:15:00"
  }
];
var INITIAL_FINANCIAL_VOUCHERS = [
  {
    id: "vouch_1",
    voucherNumber: "RV-2026-0101",
    voucherType: "RECEIPT",
    category: "INSPECTION_FINE",
    amountIqd: 75e4,
    payerOrBeneficiary: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0646\u0648\u0631 \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u062E\u0627\u0635",
    facilityId: "fac_1",
    facilityName: "\u0639\u064A\u0627\u062F\u0629 \u0627\u0644\u0646\u0648\u0631 \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u062E\u0627\u0635",
    violationId: "viol_1",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    date: "2026-09-08",
    paymentMethod: "ELECTRONIC_QI",
    referenceNumber: "QI-TX-994821",
    treasuryFund: "INSPECTION_FUND",
    status: "COLLECTED",
    issuedByUserId: "user_1",
    issuedByUserName: "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    notes: "\u062A\u0633\u062F\u064A\u062F \u0627\u0644\u063A\u0631\u0627\u0645\u0629 \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0627\u0644\u0645\u062A\u0631\u062A\u0628\u0629 \u0639\u0644\u0649 \u062A\u0634\u063A\u064A\u0644 \u0643\u0648\u0627\u062F\u0631 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635\u0629 \u0646\u0642\u0627\u0628\u064A\u0627\u064B \u0628\u0645\u0648\u062C\u0628 \u0627\u0644\u0645\u062D\u0636\u0631 \u0627\u0644\u062A\u0641\u062A\u064A\u0634\u064A \u0631\u0642\u0645 INSP-882"
  },
  {
    id: "vouch_2",
    voucherNumber: "RV-2026-0102",
    voucherType: "RECEIPT",
    category: "FACILITY_LICENSING_FEE",
    amountIqd: 5e5,
    payerOrBeneficiary: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0623\u0645\u0644 \u0627\u0644\u062A\u062E\u0635\u0635\u064A \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u062C\u0631\u0627\u062D\u064A",
    facilityId: "fac_2",
    facilityName: "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0623\u0645\u0644 \u0627\u0644\u062A\u062E\u0635\u0635\u064A \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u062C\u0631\u0627\u062D\u064A",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    date: "2026-09-07",
    paymentMethod: "BANK_TRANSFER",
    referenceNumber: "TBI-REC-48301",
    treasuryFund: "SYNDICATE_MAIN_TREASURY",
    status: "COLLECTED",
    issuedByUserId: "user_3",
    issuedByUserName: "\u0623\u062D\u0645\u062F \u0634\u0627\u0643\u0631 \u0627\u0644\u0645\u062D\u0645\u0648\u062F",
    notes: "\u0631\u0633\u0645 \u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u062A\u0641\u062A\u064A\u0634\u064A \u0627\u0644\u0633\u0646\u0648\u064A \u0648\u062A\u062C\u062F\u064A\u062F \u0631\u062E\u0635\u0629 \u0645\u0645\u0627\u0631\u0633\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u062A\u062E\u0635\u0635\u064A"
  },
  {
    id: "vouch_3",
    voucherNumber: "RV-2026-0103",
    voucherType: "RECEIPT",
    category: "DISCIPLINE_PENALTY",
    amountIqd: 1e6,
    payerOrBeneficiary: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0628\u0635\u0631\u0629 \u0644\u0644\u0639\u0646\u0627\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u0639\u0644\u0627\u062C \u0627\u0644\u0637\u0628\u064A\u0639\u064A",
    facilityId: "fac_3",
    facilityName: "\u0645\u0631\u0643\u0632 \u0627\u0644\u0628\u0635\u0631\u0629 \u0644\u0644\u0639\u0646\u0627\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629",
    provinceId: "iq_basra",
    provinceName: "\u0627\u0644\u0628\u0635\u0631\u0629",
    date: "2026-09-06",
    paymentMethod: "ZAIN_CASH",
    referenceNumber: "ZC-84920412",
    treasuryFund: "DISCIPLINE_SETTLEMENT",
    status: "COLLECTED",
    issuedByUserId: "user_1",
    issuedByUserName: "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    notes: "\u063A\u0631\u0627\u0645\u0629 \u0642\u0631\u0627\u0631 \u0644\u062C\u0646\u0629 \u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u0631\u0642\u0645 42/2026 \u0644\u0645\u062E\u0627\u0644\u0641\u0629 \u0627\u0644\u062A\u0633\u0639\u064A\u0631\u0629 \u0648\u0636\u0648\u0627\u0628\u0637 \u0627\u0644\u0636\u0645\u0627\u062F"
  },
  {
    id: "vouch_4",
    voucherNumber: "PV-2026-0041",
    voucherType: "PAYMENT",
    category: "FIELD_INSPECTION_EXPENSES",
    amountIqd: 35e4,
    payerOrBeneficiary: "\u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A - \u0642\u0637\u0627\u0639 \u0627\u0644\u0643\u0631\u062E",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    date: "2026-09-05",
    paymentMethod: "CASH",
    referenceNumber: "PETTY-KARKH-09",
    treasuryFund: "INSPECTION_FUND",
    status: "RECONCILED",
    issuedByUserId: "user_2",
    issuedByUserName: "\u0633\u0639\u062F \u0643\u0631\u064A\u0645 \u0627\u0644\u062A\u0645\u064A\u0645\u064A",
    notes: "\u0646\u062B\u0631\u064A\u0627\u062A \u0648\u0642\u0648\u062F \u0633\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062C\u0648\u0644\u0627\u062A \u0627\u0644\u062A\u0641\u062A\u064A\u0634\u064A\u0629 \u0627\u0644\u0644\u064A\u0644\u064A\u0629 \u0644\u0644\u0645\u0646\u0634\u0622\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0645\u0641\u0627\u0631\u0632 \u0627\u0644\u0636\u0628\u0637"
  },
  {
    id: "vouch_5",
    voucherNumber: "PV-2026-0042",
    voucherType: "PAYMENT",
    category: "INSPECTOR_REWARD",
    amountIqd: 25e4,
    payerOrBeneficiary: "\u0639\u0644\u064A \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0639\u0628\u064A (\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A)",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    date: "2026-09-04",
    paymentMethod: "ELECTRONIC_QI",
    referenceNumber: "QI-BONUS-3921",
    treasuryFund: "INSPECTION_FUND",
    status: "COLLECTED",
    issuedByUserId: "user_1",
    issuedByUserName: "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
    notes: "\u0645\u0643\u0627\u0641\u0623\u0629 \u0636\u0628\u0637 \u0639\u064A\u0627\u062F\u0629 \u0648\u0647\u0645\u064A\u0629 \u063A\u064A\u0631 \u0645\u062C\u0627\u0632\u0629 \u062A\u0646\u062A\u062D\u0644 \u0635\u0641\u0629 \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0641\u064A \u062D\u064A \u0627\u0644\u062C\u0627\u0645\u0639\u0629"
  },
  {
    id: "vouch_6",
    voucherNumber: "RV-2026-0104",
    voucherType: "RECEIPT",
    category: "INSPECTION_FINE",
    amountIqd: 5e5,
    payerOrBeneficiary: "\u0639\u064A\u0627\u062F\u0629 \u062F\u062C\u0644\u0629 \u0644\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0645\u0646\u0632\u0644\u064A",
    provinceId: "iq_nineveh",
    provinceName: "\u0646\u064A\u0646\u0648\u0649",
    date: "2026-09-03",
    paymentMethod: "CASH",
    referenceNumber: "REC-NIN-039",
    treasuryFund: "INSPECTION_FUND",
    status: "PENDING",
    issuedByUserId: "user_3",
    issuedByUserName: "\u0623\u062D\u0645\u062F \u0634\u0627\u0643\u0631 \u0627\u0644\u0645\u062D\u0645\u0648\u062F",
    notes: "\u063A\u0631\u0627\u0645\u0629 \u0639\u062F\u0645 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0633\u062C\u0644 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0642\u064A\u062F \u0627\u0644\u062A\u0633\u062F\u064A\u062F"
  }
];
var INITIAL_BRANCH_BUDGETS = [
  {
    id: "bgt_bgd_karkh",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0643\u0631\u062E",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 5e6,
    operationalSpentIqd: 215e4,
    collectedFinesIqd: 45e5,
    collectedFeesIqd: 82e5,
    inspectionsTarget: 40,
    inspectionsExecuted: 28
  },
  {
    id: "bgt_bgd_rusafa",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F - \u0627\u0644\u0631\u0635\u0627\u0641\u0629",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 55e5,
    operationalSpentIqd: 28e5,
    collectedFinesIqd: 62e5,
    collectedFeesIqd: 94e5,
    inspectionsTarget: 50,
    inspectionsExecuted: 36
  },
  {
    id: "bgt_basra",
    provinceId: "iq_basra",
    provinceName: "\u0627\u0644\u0628\u0635\u0631\u0629",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 4e6,
    operationalSpentIqd: 19e5,
    collectedFinesIqd: 38e5,
    collectedFeesIqd: 61e5,
    inspectionsTarget: 35,
    inspectionsExecuted: 22
  },
  {
    id: "bgt_nineveh",
    provinceId: "iq_nineveh",
    provinceName: "\u0646\u064A\u0646\u0648\u0649",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 35e5,
    operationalSpentIqd: 14e5,
    collectedFinesIqd: 29e5,
    collectedFeesIqd: 47e5,
    inspectionsTarget: 30,
    inspectionsExecuted: 19
  },
  {
    id: "bgt_karbala",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 3e6,
    operationalSpentIqd: 12e5,
    collectedFinesIqd: 24e5,
    collectedFeesIqd: 39e5,
    inspectionsTarget: 25,
    inspectionsExecuted: 18
  },
  {
    id: "bgt_najaf",
    provinceId: "iq_najaf",
    provinceName: "\u0627\u0644\u0646\u062C\u0641 \u0627\u0644\u0623\u0634\u0631\u0641",
    fiscalMonth: "2026-09",
    operationalAllocatedIqd: 3e6,
    operationalSpentIqd: 11e5,
    collectedFinesIqd: 21e5,
    collectedFeesIqd: 36e5,
    inspectionsTarget: 25,
    inspectionsExecuted: 16
  }
];
var INITIAL_CHAT_MESSAGES = [
  // 1. National Broadcasts Channel (شامل لكافة المحافظات)
  {
    id: "msg_nat_1",
    channelId: "national_broadcasts",
    senderId: "user_1",
    senderName: "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A (\u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A)",
    senderRole: "HIGH_COMMAND",
    senderRoleTitle: "\u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A \u2014 \u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645",
    senderBadge: "NURSE-HQ-001",
    provinceId: "all",
    provinceName: "\u0639\u0645\u0648\u0645 \u0627\u0644\u0639\u0631\u0627\u0642",
    messageText: "\u{1F4E2} [\u062A\u0628\u0644\u064A\u063A \u0639\u0627\u0645 \u0635\u0627\u062F\u0631 \u0645\u0646 \u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A \u0625\u0644\u0649 \u0643\u0627\u0641\u0629 \u0641\u0631\u0648\u0639 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0627\u0644\u0640 18]: \u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u0632\u0645\u0644\u0627\u0621\u0646\u0627 \u0641\u064A \u0643\u0627\u0641\u0629 \u0627\u0644\u0641\u0631\u0648\u0639 \u0648\u0644\u062C\u0627\u0646 \u0627\u0644\u062A\u0641\u062A\u064A\u0634. \u064A\u064F\u0644\u0632\u0645 \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u0641\u062A\u0634\u064A\u0646 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u064A\u0646 \u0628\u0627\u0644\u062A\u062F\u0642\u064A\u0642 \u0627\u0644\u0635\u0627\u0631\u0645 \u0639\u0644\u0649 \u0628\u0637\u0627\u0642\u0627\u062A \u0627\u0644\u0627\u0646\u062A\u0633\u0627\u0628 \u0627\u0644\u0646\u0642\u0627\u0628\u064A \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A GPS \u0644\u062C\u0645\u064A\u0639 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A \u0627\u0644\u0623\u0647\u0644\u064A\u0629 \u0628\u062F\u0648\u0646 \u0627\u0633\u062A\u062B\u0646\u0627\u0621.",
    timestamp: "2026-09-09 08:30",
    type: "CENTRAL_BROADCAST",
    isNationwideBroadcast: true,
    broadcastTarget: "ALL_BRANCHES"
  },
  {
    id: "msg_nat_2",
    channelId: "national_broadcasts",
    senderId: "user_deputy",
    senderName: "\u0623. \u062F. \u0623\u062D\u0645\u062F \u0627\u0644\u062D\u0633\u064A\u0646\u064A (\u0646\u0627\u0626\u0628 \u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636)",
    senderRole: "HIGH_COMMAND",
    senderRoleTitle: "\u0646\u0627\u0626\u0628 \u0646\u0642\u064A\u0628 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A",
    senderBadge: "NURSE-HQ-002",
    provinceId: "all",
    provinceName: "\u0639\u0645\u0648\u0645 \u0627\u0644\u0639\u0631\u0627\u0642",
    messageText: "\u{1F4E2} [\u062A\u0648\u062C\u064A\u0647 \u0631\u0642\u0627\u0628\u064A \u0639\u0627\u0645 \u0645\u0646 \u0646\u0627\u0626\u0628 \u0627\u0644\u0646\u0642\u064A\u0628]: \u0646\u0624\u0643\u062F \u0639\u0644\u0649 \u062C\u0645\u064A\u0639 \u0627\u0644\u0644\u062C\u0627\u0646 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0641\u064A \u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0639\u062F\u0645 \u0627\u0644\u062A\u0647\u0627\u0648\u0646 \u0645\u0639 \u0623\u064A \u0645\u0645\u0627\u0631\u0633\u0627\u062A \u062A\u062C\u0645\u064A\u0644\u064A\u0629 \u0623\u0648 \u062C\u0631\u0627\u062D\u064A\u0629 \u062A\u062C\u0631\u064A \u062F\u0627\u062E\u0644 \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u062E\u0627\u0631\u062C \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0645\u0647\u0646\u064A\u0629\u060C \u0648\u0631\u0641\u0639 \u062A\u0642\u0627\u0631\u064A\u0631 \u0627\u0644\u063A\u0644\u0642 \u0641\u0648\u0631\u0627\u064B \u0644\u0644\u062C\u0646\u0629 \u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629.",
    timestamp: "2026-09-09 09:15",
    type: "CENTRAL_BROADCAST",
    isNationwideBroadcast: true,
    broadcastTarget: "ALL_BRANCHES"
  },
  {
    id: "msg_nat_3",
    channelId: "national_broadcasts",
    senderId: "user_baghdad_hq",
    senderName: "\u0645. \u062D\u064A\u062F\u0631 \u0627\u0644\u0645\u0648\u0633\u0648\u064A (\u0645\u0633\u0624\u0648\u0644 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F \u0648\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645)",
    senderRole: "BRANCH_DIRECTOR",
    senderRoleTitle: "\u0645\u0633\u0624\u0648\u0644 \u0641\u0631\u0639 \u0628\u063A\u062F\u0627\u062F / \u0645\u0646\u0633\u0642 \u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645",
    senderBadge: "NURSE-BGD-HQ",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F (\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645)",
    messageText: "\u{1F4E2} [\u062A\u0628\u0644\u064A\u063A \u0639\u0645\u0644\u064A\u0627\u062A\u064A \u0639\u0627\u0645 \u0644\u0643\u0627\u0641\u0629 \u0627\u0644\u0641\u0631\u0648\u0639]: \u062A\u0645 \u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u0631\u0628\u0637 \u0627\u0644\u0644\u0627\u0633\u0644\u0643\u064A \u0627\u0644\u0645\u0648\u062D\u062F \u0628\u064A\u0646 \u063A\u0631\u0641 \u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0648\u0627\u0644\u0645\u0642\u0631 \u0627\u0644\u0639\u0627\u0645. \u064A\u0631\u062C\u0649 \u0645\u0646 \u0645\u062F\u064A\u0631\u064A \u0627\u0644\u0641\u0631\u0648\u0639 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u062A\u0632\u0648\u064A\u062F\u0646\u0627 \u0628\u0627\u0644\u0645\u0648\u0642\u0641 \u0627\u0644\u064A\u0648\u0645\u064A \u0644\u0644\u062C\u0648\u0644\u0627\u062A \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0639\u0628\u0631 \u0627\u0644\u0645\u0646\u0635\u0629 \u0628\u062D\u0644\u0648\u0644 \u0627\u0644\u0633\u0627\u0639\u0629 3 \u0639\u0635\u0631\u0627\u064B.",
    timestamp: "2026-09-09 10:00",
    type: "CENTRAL_BROADCAST",
    isNationwideBroadcast: true,
    broadcastTarget: "ALL_BRANCHES"
  },
  // 2. Karbala Province Local Channel (محصورة بمفتشي كربلاء ولجنة كربلاء فقط)
  {
    id: "msg_krb_1",
    channelId: "province_iq_karbala",
    senderId: "user_karbala_dir",
    senderName: "\u0623. \u0643\u0631\u0627\u0631 \u0639\u0628\u062F \u0627\u0644\u0631\u0636\u0627",
    senderRole: "BRANCH_DIRECTOR",
    senderRoleTitle: "\u0645\u062F\u064A\u0631 \u0641\u0631\u0639 \u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    senderBadge: "NURSE-KRB-001",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    messageText: "\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645 \u064A\u0627 \u0623\u0628\u0637\u0627\u0644 \u0645\u0641\u0631\u0632\u0629 \u0643\u0631\u0628\u0644\u0627\u0621. \u062C\u062F\u0648\u0644 \u0627\u0644\u064A\u0648\u0645 \u064A\u0634\u0645\u0644 \u0645\u0646\u0637\u0642\u0629 \u0634\u0627\u0631\u0639 \u0627\u0644\u0625\u0633\u0643\u0627\u0646 \u0648\u0645\u062D\u064A\u0637 \u0627\u0644\u0639\u0628\u0627\u0633 \u0648\u0645\u062C\u0645\u0639 \u0627\u0644\u0643\u0641\u064A\u0644 \u0627\u0644\u0637\u0628\u064A. \u0646\u0631\u0643\u0632 \u0639\u0644\u0649 \u0641\u062D\u0635 \u0635\u0644\u0627\u062D\u064A\u0627\u062A \u0627\u0644\u0623\u062F\u0648\u064A\u0629 \u0648\u062D\u0636\u0648\u0631 \u0627\u0644\u0645\u0645\u0631\u0636 \u0627\u0644\u0645\u0633\u0624\u0648\u0644 \u0627\u0644\u0645\u062C\u0627\u0632.",
    timestamp: "2026-09-09 09:30",
    type: "TEXT"
  },
  {
    id: "msg_krb_2",
    channelId: "province_iq_karbala",
    senderId: "user_karbala_insp",
    senderName: "\u0633\u062C\u0627\u062F \u0643\u0627\u0638\u0645 \u0627\u0644\u0623\u0633\u062F\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0643\u0631\u0628\u0644\u0627\u0621",
    senderBadge: "INSP-KRB-04",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    messageText: "\u062F\u0648\u0631\u064A\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0648\u0635\u0644\u062A \u0627\u0644\u0622\u0646 \u0625\u0644\u0649 \u0634\u0627\u0631\u0639 \u0627\u0644\u0625\u0633\u0643\u0627\u0646 \u0641\u064A \u0643\u0631\u0628\u0644\u0627\u0621\u060C \u0628\u062F\u0623\u0646\u0627 \u0628\u0645\u0637\u0627\u0628\u0642\u0629 \u0647\u0648\u064A\u0627\u062A \u0627\u0644\u0643\u0627\u062F\u0631 \u0641\u064A 4 \u0639\u064A\u0627\u062F\u0627\u062A \u062A\u062E\u0635\u0635\u064A\u0629 \u0648\u0648\u062C\u062F\u0646\u0627 \u0627\u0644\u062A\u0632\u0627\u0645\u0627\u064B \u0645\u0645\u062A\u0627\u0632\u0627\u064B \u0628\u0627\u0644\u0631\u062F\u0627\u0621 \u0648\u0627\u0644\u0628\u0627\u062C.",
    timestamp: "2026-09-09 10:45",
    type: "LOCATION_ALERT"
  },
  {
    id: "msg_krb_3",
    channelId: "province_iq_karbala",
    senderId: "user_karbala_insp",
    senderName: "\u0633\u062C\u0627\u062F \u0643\u0627\u0638\u0645 \u0627\u0644\u0623\u0633\u062F\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0643\u0631\u0628\u0644\u0627\u0621",
    senderBadge: "INSP-KRB-04",
    provinceId: "iq_karbala",
    provinceName: "\u0643\u0631\u0628\u0644\u0627\u0621 \u0627\u0644\u0645\u0642\u062F\u0633\u0629",
    messageText: "\u26A0\uFE0F [\u0628\u0644\u0627\u063A \u0639\u0627\u062C\u0644 - \u0643\u0631\u0628\u0644\u0627\u0621]: \u0631\u0635\u062F \u0639\u064A\u0627\u062F\u0629 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635\u0629 \u0641\u064A \u062D\u064A \u0627\u0644\u0645\u0639\u0644\u0645\u064A\u0646 \u062A\u062F\u0639\u064A \u0639\u0644\u0627\u062C \u0648\u062A\u0636\u0645\u0627\u062F \u0628\u062F\u0648\u0646 \u0625\u062C\u0627\u0632\u0629 \u0646\u0642\u0627\u0628\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u060C \u062A\u0645 \u062A\u0646\u0638\u064A\u0645 \u0645\u062D\u0636\u0631 \u0636\u0628\u0637 \u0628\u062D\u0636\u0648\u0631 \u0627\u0644\u0642\u0648\u0627\u062A \u0627\u0644\u0623\u0645\u0646\u064A\u0629 \u0627\u0644\u0633\u0627\u0646\u062F\u0629.",
    timestamp: "2026-09-09 11:30",
    type: "URGENT_DISPATCH"
  },
  // 3. Basra Province Local Channel (محصورة بمفتشي البصرة فقط)
  {
    id: "msg_bsr_1",
    channelId: "province_iq_basra",
    senderId: "user_7",
    senderName: "\u0639\u0645\u0627\u0631 \u062C\u0627\u0633\u0645 \u0627\u0644\u0628\u0635\u0631\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0627\u0644\u0628\u0635\u0631\u0629",
    senderBadge: "INSP-BSR-92",
    provinceId: "iq_basra",
    provinceName: "\u0627\u0644\u0628\u0635\u0631\u0629",
    messageText: "\u0635\u0628\u0627\u062D \u0627\u0644\u062E\u064A\u0631 \u0644\u0632\u0645\u0644\u0627\u0626\u064A \u0645\u0641\u062A\u0634\u064A \u0641\u0631\u0639 \u0627\u0644\u0628\u0635\u0631\u0629. \u0628\u062F\u0623\u062A \u062C\u0648\u0644\u062A\u064A \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0639\u0634\u0627\u0631 \u0648\u0634\u0627\u0631\u0639 \u0627\u0644\u0627\u0633\u062A\u0642\u0644\u0627\u0644 \u0627\u0644\u0637\u0628\u064A \u0645\u0639 \u0645\u0641\u0631\u0632\u0629 \u0627\u0644\u0623\u0645\u0646 \u0627\u0644\u0648\u0642\u0627\u0626\u064A.",
    timestamp: "2026-09-09 09:20",
    type: "TEXT"
  },
  {
    id: "msg_bsr_2",
    channelId: "province_iq_basra",
    senderId: "user_7",
    senderName: "\u0639\u0645\u0627\u0631 \u062C\u0627\u0633\u0645 \u0627\u0644\u0628\u0635\u0631\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0627\u0644\u0628\u0635\u0631\u0629",
    senderBadge: "INSP-BSR-92",
    provinceId: "iq_basra",
    provinceName: "\u0627\u0644\u0628\u0635\u0631\u0629",
    messageText: "\u062A\u0645 \u0627\u0633\u062A\u0643\u0645\u0627\u0644 \u0641\u062D\u0635 8 \u0639\u064A\u0627\u062F\u0627\u062A \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0641\u064A \u0645\u0646\u0637\u0642\u0629 \u0627\u0644\u0639\u0634\u0627\u0631 \u0628\u0627\u0644\u0628\u0635\u0631\u0629\u060C \u0648\u0645\u0637\u0627\u0628\u0642\u0629 \u0647\u0648\u064A\u0627\u062A 24 \u0645\u0645\u0631\u0636\u0627\u064B \u0628\u0646\u062C\u0627\u062D \u0639\u0628\u0631 \u0642\u0627\u0631\u0626 \u0627\u0644\u0640 QR \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A.",
    timestamp: "2026-09-09 12:20",
    type: "LOCATION_ALERT"
  },
  // 4. Baghdad Province Local Channel (محصورة بمفتشي بغداد)
  {
    id: "msg_bgd_1",
    channelId: "province_iq_baghdad",
    senderId: "user_5",
    senderName: "\u0639\u0644\u064A \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0639\u0628\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A \u2014 \u0628\u063A\u062F\u0627\u062F \u0627\u0644\u0643\u0631\u062E",
    senderBadge: "INSP-BGD-88",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    messageText: "\u062A\u0645 \u0631\u0635\u062F \u0645\u0645\u0627\u0631\u0633\u0629 \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635\u0629 \u0641\u064A \u0639\u064A\u0627\u062F\u0629 \u062A\u062C\u0645\u064A\u0644\u064A\u0629 \u062A\u062F\u0639\u064A \u062A\u0642\u062F\u064A\u0645 \u062E\u062F\u0645\u0627\u062A \u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0641\u064A \u0634\u0627\u0631\u0639 14 \u0631\u0645\u0636\u0627\u0646 \u0628\u0627\u0644\u0645\u0646\u0635\u0648\u0631. \u062A\u0645 \u062A\u0646\u0638\u064A\u0645 \u0645\u062D\u0636\u0631 \u0643\u0634\u0641 \u0648\u062A\u062B\u0628\u064A\u062A \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0629 \u0648\u0646\u0637\u0644\u0628 \u0623\u0645\u0631 \u063A\u0644\u0642 \u0641\u0648\u0631\u064A.",
    timestamp: "2026-09-09 10:15",
    type: "URGENT_DISPATCH",
    attachment: {
      type: "VIOLATION_EVIDENCE",
      title: "\u0645\u062D\u0636\u0631 \u0643\u0634\u0641 \u0645\u064A\u062F\u0627\u0646\u064A \u0648\u0645\u062E\u0627\u0644\u0641\u0629 \u0645\u0632\u0627\u0648\u0644\u0629 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635\u0629",
      referenceId: "viol_1"
    }
  },
  {
    id: "msg_bgd_2",
    channelId: "province_iq_baghdad",
    senderId: "user_6",
    senderName: "\u0632\u064A\u0646\u0628 \u0641\u0627\u0636\u0644 \u0627\u0644\u0632\u0628\u064A\u062F\u064A",
    senderRole: "FIELD_INSPECTOR",
    senderRoleTitle: "\u0645\u0641\u062A\u0634\u0629 \u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u2014 \u0628\u063A\u062F\u0627\u062F \u0627\u0644\u0631\u0635\u0627\u0641\u0629",
    senderBadge: "INSP-BGD-89",
    provinceId: "iq_baghdad",
    provinceName: "\u0628\u063A\u062F\u0627\u062F",
    messageText: "\u0641\u0631\u064A\u0642 \u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0631\u0635\u0627\u0641\u0629 \u0645\u062A\u0648\u0627\u062C\u062F \u0627\u0644\u0622\u0646 \u0641\u064A \u0634\u0627\u0631\u0639 \u0641\u0644\u0633\u0637\u064A\u0646 \u0648\u0632\u064A\u0648\u0646\u0629\u060C \u062A\u0645 \u0643\u0634\u0641 6 \u0639\u064A\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0645\u0646\u062A\u0638\u0645\u0629 \u0648\u0645\u0644\u062A\u0632\u0645\u0629 \u0628\u0627\u0644\u0645\u0639\u0627\u064A\u064A\u0631 \u0627\u0644\u0635\u062D\u064A\u0629.",
    timestamp: "2026-09-09 11:10",
    type: "LOCATION_ALERT"
  }
];
var INITIAL_BROADCASTS = [
  {
    id: "brd_1",
    code: "CIRC-2026-041",
    title: "\u062A\u0639\u0645\u064A\u0645 \u0639\u0627\u062C\u0644: \u062D\u0638\u0631 \u0627\u0644\u0645\u062F\u0627\u062E\u0644\u0627\u062A \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u062A\u062C\u0645\u064A\u0644\u064A\u0629 \u0641\u064A \u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u0648\u0641\u064A\u0629 \u0644\u0644\u0634\u0631\u0648\u0637",
    summary: "\u0627\u0633\u062A\u0646\u0627\u062F\u0627\u064B \u0625\u0644\u0649 \u0642\u0627\u0646\u0648\u0646 \u0646\u0642\u0627\u0628\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A\u0629 \u0648\u0642\u0631\u0627\u0631 \u0644\u062C\u0646\u0629 \u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629\u060C \u064A\u064F\u0645\u0646\u0639 \u0645\u0646\u0639\u0627\u064B \u0628\u0627\u062A\u0627\u064B \u0645\u0645\u0627\u0631\u0633\u0629 \u0623\u064A \u0646\u0634\u0627\u0637 \u062A\u0645\u0631\u064A\u0636\u064A \u0645\u062A\u0642\u062F\u0645 \u0641\u064A \u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u062C\u0645\u064A\u0644\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u0633\u062A\u0648\u0635\u0641\u0627\u062A \u062F\u0648\u0646 \u0648\u062C\u0648\u062F \u0625\u062C\u0627\u0632\u0629 \u0645\u0645\u0627\u0631\u0633\u0629 \u0646\u0627\u0641\u0630\u0629 \u0648\u0645\u0633\u0624\u0648\u0644 \u062A\u0645\u0631\u064A\u0636\u064A \u062C\u0627\u0645\u0639\u064A \u0645\u062C\u0627\u0632.",
    urgency: "URGENT",
    issuedBy: "\u0645\u062C\u0644\u0633 \u0627\u0644\u0646\u0642\u0627\u0628\u0629 \u0648\u0644\u062C\u0646\u0629 \u0627\u0644\u0627\u0646\u0636\u0628\u0627\u0637 \u0627\u0644\u0645\u0631\u0643\u0632\u064A\u0629",
    targetScope: "ALL_BRANCHES",
    issueDate: "2026-09-08",
    actionRequired: "\u0625\u062C\u0631\u0627\u0621 \u0645\u0633\u062D \u062A\u0641\u062A\u064A\u0634\u064A \u0641\u0648\u0631\u064A \u0648\u0625\u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u064A\u0646 \u0644\u0644\u0642\u0636\u0627\u0621 \u0627\u0644\u0646\u0642\u0627\u0628\u064A",
    isActive: true
  },
  {
    id: "brd_2",
    code: "CIRC-2026-039",
    title: "\u062A\u0648\u062C\u064A\u0647 \u062A\u0646\u0638\u064A\u0645\u064A: \u0625\u0644\u0632\u0627\u0645\u064A\u0629 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A \u0627\u0644\u0645\u0632\u062F\u0648\u062C (D-GPS) \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0643\u0634\u0641 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A",
    summary: "\u062A\u0624\u0643\u062F \u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0639\u0627\u0645\u0629 \u0639\u0644\u0649 \u0636\u0631\u0648\u0631\u0629 \u0639\u062F\u0645 \u0625\u063A\u0644\u0627\u0642 \u0623\u0648 \u0627\u0639\u062A\u0645\u0627\u062F \u0623\u064A \u0645\u062D\u0636\u0631 \u0643\u0634\u0641 \u0645\u0627 \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0637\u0627\u0628\u0642 \u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A \u0627\u0644\u0645\u0641\u062A\u0634 \u0645\u0639 \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0628\u0645\u062F\u0649 \u062F\u0642\u0629 \u0644\u0627 \u064A\u062A\u062C\u0627\u0648\u0632 150 \u0645\u062A\u0631\u0627\u064B \u0644\u062D\u0645\u0627\u064A\u0629 \u0646\u0632\u0627\u0647\u0629 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631.",
    urgency: "IMPORTANT",
    issuedBy: "\u0625\u062F\u0627\u0631\u0629 \u0644\u062C\u0627\u0646 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0648\u0627\u0644\u0631\u0642\u0627\u0628\u0629",
    targetScope: "ALL_BRANCHES",
    issueDate: "2026-09-05",
    actionRequired: "\u062A\u0641\u0639\u064A\u0644 \u0627\u0644\u062C\u064A \u0628\u064A \u0627\u0633 \u0648\u0627\u0644\u0627\u0645\u062A\u062B\u0627\u0644 \u0644\u0644\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644 \u0627\u0644\u062A\u0642\u0646\u064A",
    isActive: true
  }
];

// src/data/sqlSchema.ts
var SQL_DATABASE_SCHEMA = `
-- ====================================================================
-- NATIONAL IRAQI NURSING SYNDICATE INSPECTION PLATFORM
-- PostgreSQL DDL Database Schema Structure
-- ====================================================================

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    province VARCHAR(100) NOT NULL,
    badge_number VARCHAR(50),
    phone VARCHAR(50),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'hospital', 'clinic', 'center', 'beauty_center', etc.
    sector VARCHAR(50) NOT NULL, -- 'private', 'public'
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    address TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    license_number VARCHAR(100),
    license_status VARCHAR(50) NOT NULL, -- 'valid', 'expired', 'unlicensed'
    owner_name VARCHAR(255),
    director_name VARCHAR(255),
    phone VARCHAR(50),
    nursing_staff_count INT DEFAULT 0,
    compliance_score INT DEFAULT 100,
    risk_level VARCHAR(50) DEFAULT 'low',
    last_inspection_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nurse_staff (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    syndicate_id VARCHAR(50) UNIQUE NOT NULL,
    qualification VARCHAR(100) NOT NULL,
    specialization VARCHAR(100),
    registration_status VARCHAR(50) NOT NULL, -- 'registered', 'pending', 'expired', 'fake'
    national_id VARCHAR(50),
    phone VARCHAR(50),
    hired_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_committees (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    lead_inspector_id VARCHAR(50) REFERENCES users(id),
    members JSONB, -- Array of inspector IDs
    assigned_zone_ids JSONB, -- Array of zone IDs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inspection_assignments (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    committee_id VARCHAR(50) REFERENCES inspection_committees(id),
    inspector_id VARCHAR(50) REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
    priority VARCHAR(50) DEFAULT 'medium',
    scheduled_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS violation_records (
    id VARCHAR(50) PRIMARY KEY,
    facility_id VARCHAR(50) REFERENCES facilities(id) ON DELETE CASCADE,
    assignment_id VARCHAR(50) REFERENCES inspection_assignments(id),
    inspector_id VARCHAR(50) REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL, -- 'minor', 'moderate', 'severe', 'critical'
    description TEXT NOT NULL,
    fine_amount DECIMAL(12,2) DEFAULT 0.00,
    legal_action VARCHAR(255),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS district_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    coordinates JSONB NOT NULL, -- Polygon boundary lat/lng points
    risk_level VARCHAR(50) DEFAULT 'medium',
    assigned_committee_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
var SCHEMA_TABLES_DOCS = [
  { name: "users", desc: "\u0625\u062F\u0627\u0631\u0629 \u062D\u0633\u0627\u0628\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0648\u0627\u0644\u0645\u0641\u062A\u0634\u064A\u0646 \u0648\u0631\u0624\u0633\u0627\u0621 \u0627\u0644\u0644\u062C\u0627\u0646 \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A" },
  { name: "facilities", desc: "\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0624\u0633\u0633\u0627\u062A \u0627\u0644\u0635\u062D\u064A\u0629 \u0648\u0627\u0644\u0639\u064A\u0627\u062F\u0627\u062A \u0648\u0627\u0644\u0645\u0633\u062A\u0634\u0641\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u0631\u0627\u0643\u0632 \u0627\u0644\u062A\u062E\u0635\u0635\u064A\u0629" },
  { name: "nurse_staff", desc: "\u0633\u062C\u0644 \u0627\u0644\u0643\u0648\u0627\u062F\u0631 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A\u0629 \u0648\u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0647\u0648\u064A\u0627\u062A \u0627\u0644\u0646\u0642\u0627\u0628\u064A\u0629 \u0648\u0645\u0624\u0647\u0644\u0627\u062A\u0647\u0645" },
  { name: "inspection_committees", desc: "\u062A\u0634\u0643\u064A\u0644 \u0644\u062C\u0627\u0646 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0648\u062A\u062D\u062F\u064A\u062F \u0627\u0644\u0646\u0637\u0627\u0642\u0627\u062A \u0648\u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0629 \u0627\u0644\u0645\u0633\u0646\u062F\u0629" },
  { name: "inspection_assignments", desc: "\u062C\u062F\u0648\u0644\u0629 \u0627\u0644\u0645\u0647\u0627\u0645 \u0648\u0627\u0644\u0632\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u062A\u0641\u062A\u064A\u0634\u064A\u0629 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A\u0629 \u0648\u062A\u062A\u0628\u0639 \u062D\u0627\u0644\u062A\u0647\u0627" },
  { name: "violation_records", desc: "\u0645\u062D\u0627\u0636\u0631 \u0627\u0644\u0645\u062E\u0627\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u063A\u0631\u0627\u0645\u0627\u062A \u0648\u0627\u0644\u0625\u062C\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0642\u0627\u0646\u0648\u0646\u064A\u0629 \u0627\u0644\u0645\u062A\u062E\u0630\u0629" },
  { name: "district_zones", desc: "\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0648\u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 \u0628\u0625\u062D\u062F\u0627\u062B\u064A\u0627\u062A GIS" }
];

// server.ts
var usersStore = [...INITIAL_USERS];
var facilitiesStore = [...INITIAL_FACILITIES];
var nursesStore = [...INITIAL_NURSES];
var assignmentsStore = [...INITIAL_ASSIGNMENTS];
var violationsStore = [...INITIAL_VIOLATIONS];
var reportsStore = [];
var vouchersStore = [...INITIAL_FINANCIAL_VOUCHERS];
var branchBudgetsStore = [...INITIAL_BRANCH_BUDGETS];
var chatMessagesStore = [...INITIAL_CHAT_MESSAGES];
var broadcastsStore = [...INITIAL_BROADCASTS];
function calculateGpsDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
async function startServer() {
  const app = (0, import_express.default)();
  const mobileApp = (0, import_express.default)();
  const apiRouter = import_express.default.Router();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "15mb" }));
  apiRouter.get("/provinces", (req, res) => {
    res.json(INITIAL_PROVINCES);
  });
  apiRouter.get("/zones", (req, res) => {
    const { provinceId } = req.query;
    if (provinceId) {
      res.json(INITIAL_DISTRICT_ZONES.filter((z) => z.provinceId === provinceId));
    } else {
      res.json(INITIAL_DISTRICT_ZONES);
    }
  });
  apiRouter.get("/users", (req, res) => {
    const { role, provinceId } = req.query;
    let results = [...usersStore];
    if (role && typeof role === "string") {
      results = results.filter((u) => u.role === role);
    }
    if (provinceId && typeof provinceId === "string") {
      results = results.filter((u) => u.provinceId === provinceId);
    }
    res.json(results);
  });
  app.post(["/api/login", "/api/auth/login"], (req, res) => {
    const { username, password } = req.body || {};
    const cleanUser = (username || "").trim();
    const cleanPass = (password || "").trim();
    const matched = usersStore.find(
      (u) => (u.username?.toLowerCase() === cleanUser.toLowerCase() || u.badgeNumber?.toLowerCase() === cleanUser.toLowerCase()) && u.password === cleanPass
    );
    if (matched || cleanUser.toLowerCase() === "test1" && cleanPass === "test1") {
      const u = matched || {
        id: "user_test1",
        name: "\u0645\u0641\u062A\u0634 \u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0639\u0627\u0645\u0629 (test1)",
        role: "INSPECTION_DIRECTOR",
        badgeNumber: "INSP-TEST-001",
        phone: "07700000001",
        email: "test1@syndicate-nurse.iq",
        username: "test1",
        provinceId: "all",
        provinceName: "\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A (\u0635\u0644\u0627\u062D\u064A\u0629 \u0634\u0627\u0645\u0644\u0629)",
        assignedZoneId: "all_zones",
        assignedZoneName: "\u0643\u0627\u0641\u0629 \u0627\u0644\u0632\u0648\u0646\u0627\u062A \u0648\u0627\u0644\u0642\u0637\u0627\u0639\u0627\u062A \u0641\u064A \u0639\u0645\u0648\u0645 \u0627\u0644\u0639\u0631\u0627\u0642 (\u0634\u0627\u0645\u0644)"
      };
      const isAllAuthority = u.username === "test1" || u.role === "HIGH_COMMAND" || u.role === "INSPECTION_DIRECTOR" || u.provinceId === "all";
      return res.json({
        success: true,
        user: {
          id: u.id,
          username: u.username,
          name: u.name,
          role: isAllAuthority ? "admin" : "branch_manager",
          userRole: isAllAuthority ? "admin" : "branch_manager",
          roleTitle: u.username === "test1" ? "\u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0639\u0627\u0645\u0629 (\u0643\u0627\u0641\u0629 \u0627\u0644\u0645\u062D\u0627\u0641\u0638\u0627\u062A \u0648\u0627\u0644\u0632\u0648\u0646\u0627\u062A)" : u.role === "HIGH_COMMAND" ? "\u0627\u0644\u0642\u064A\u0627\u062F\u0629 \u0627\u0644\u0639\u0644\u064A\u0627 (\u0627\u0644\u0646\u0642\u064A\u0628)" : u.role === "INSPECTION_DIRECTOR" ? "\u0645\u0633\u0624\u0648\u0644 \u0644\u062C\u0646\u0629 \u0627\u0644\u062A\u0641\u062A\u064A\u0634" : "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A",
          gov: isAllAuthority ? "" : u.provinceName || "",
          unionId: u.badgeNumber,
          assignedZone: u.assignedZoneName || "\u0643\u0627\u0641\u0629 \u0627\u0644\u0632\u0648\u0646\u0627\u062A",
          isAllZones: isAllAuthority
        }
      });
    }
    return res.status(401).json({
      success: false,
      message: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629"
    });
  });
  apiRouter.post("/forgot-password", (req, res) => {
    const { phone } = req.body || {};
    const cleanPhone = (phone || "").trim();
    if (!cleanPhone) {
      return res.status(400).json({ success: false, message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0645\u0637\u0644\u0648\u0628" });
    }
    const user = usersStore.find((u) => u.phone === cleanPhone);
    if (user) {
      console.log(`[WHATSAPP SIMULATION] \u{1F4DE} Message to ${cleanPhone}:`);
      console.log(`\u0645\u0631\u062D\u0628\u0627\u064B ${user.name}\u060C
\u0644\u0642\u062F \u0637\u0644\u0628\u062A \u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0643 \u0641\u064A \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0648\u0637\u0646\u064A\u0629 \u0644\u0644\u0631\u0642\u0627\u0628\u0629 \u0648\u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0635\u062D\u064A.
\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645: ${user.username}
\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631: ${user.password}

\u0646\u0631\u062C\u0648 \u062A\u063A\u064A\u064A\u0631\u0647\u0627 \u0628\u0639\u062F \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u062D\u0641\u0627\u0638\u0627\u064B \u0639\u0644\u0649 \u0627\u0644\u0633\u0631\u064A\u0629.`);
      return res.json({ success: true, message: "\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0625\u0644\u0649 \u0631\u0642\u0645 \u0627\u0644\u0648\u0627\u062A\u0633\u0627\u0628 \u0627\u0644\u062E\u0627\u0635 \u0628\u0643 \u0628\u0646\u062C\u0627\u062D" });
    } else {
      return res.status(404).json({ success: false, message: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645" });
    }
  });
  apiRouter.post("/users", (req, res) => {
    const body = req.body;
    const newUser = {
      id: `user_${Date.now()}`,
      name: body.name,
      role: body.role || "FIELD_INSPECTOR",
      badgeNumber: body.badgeNumber || `INSP-2026-${Math.floor(100 + Math.random() * 900)}`,
      phone: body.phone || "",
      email: body.email || "",
      username: body.username || `user_${Math.floor(1e3 + Math.random() * 9e3)}`,
      password: body.password || "Nur2026!Pass",
      nationalId: body.nationalId || "",
      educationQualification: body.educationQualification || "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0639\u0644\u0648\u0645 \u062A\u0645\u0631\u064A\u0636",
      specialization: body.specialization || "\u0631\u0642\u0627\u0628\u0629 \u0648\u062A\u0641\u062A\u064A\u0634 \u0635\u062D\u064A",
      provinceId: body.provinceId || "iq_baghdad",
      provinceName: body.provinceName || "\u0628\u063A\u062F\u0627\u062F",
      assignedZoneId: body.assignedZoneId || "zone_karkh",
      assignedZoneName: body.assignedZoneName || "\u0642\u0637\u0627\u0639 \u0627\u0644\u062A\u0641\u062A\u064A\u0634",
      status: body.status || "ACTIVE",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      notes: body.notes || ""
    };
    usersStore.unshift(newUser);
    res.status(201).json(newUser);
  });
  apiRouter.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const index = usersStore.findIndex((u) => u.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    usersStore[index] = { ...usersStore[index], ...req.body };
    res.json(usersStore[index]);
  });
  apiRouter.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    usersStore = usersStore.filter((u) => u.id !== id);
    res.json({ success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D" });
  });
  apiRouter.get("/facilities", (req, res) => {
    const { zoneId, provinceId, search, status } = req.query;
    let results = [...facilitiesStore];
    if (zoneId) {
      results = results.filter((f) => f.zoneId === zoneId);
    } else if (provinceId) {
      results = results.filter((f) => f.provinceId === provinceId);
    }
    if (status) {
      results = results.filter((f) => f.licenseStatus === status || f.inspectionStatus === status);
    }
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (f) => f.name.toLowerCase().includes(q) || f.licenseNumber.toLowerCase().includes(q) || f.ownerName.toLowerCase().includes(q) || f.ownerPhone.includes(q) || f.neighborhood.toLowerCase().includes(q)
      );
    }
    res.json(results);
  });
  apiRouter.get("/facilities/:id", (req, res) => {
    const facility = facilitiesStore.find((f) => f.id === req.params.id);
    if (!facility) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const facilityNurses = nursesStore.filter((n) => n.currentFacilityId === facility.id);
    const facilityAssignments = assignmentsStore.filter((a) => a.facilityId === facility.id);
    const facilityViolations = violationsStore.filter((v) => v.facilityId === facility.id);
    res.json({
      ...facility,
      nurses: facilityNurses,
      assignments: facilityAssignments,
      violations: facilityViolations
    });
  });
  apiRouter.post("/facilities", (req, res) => {
    const body = req.body;
    const newFacility = {
      id: `fac_${Date.now()}`,
      licenseNumber: body.licenseNumber || `IRQ-NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      name: body.name,
      type: body.type || "CLINIC",
      provinceId: body.provinceId || "iq_baghdad",
      zoneId: body.zoneId || "zone_karkh",
      districtArea: body.districtArea || "\u0627\u0644\u0642\u0636\u0627\u0621 \u0627\u0644\u0645\u0631\u0643\u0632",
      neighborhood: body.neighborhood || "\u062D\u064A \u0639\u0627\u0645",
      addressDetail: body.addressDetail || "",
      ownerName: body.ownerName || "",
      ownerPhone: body.ownerPhone || "",
      latitude: Number(body.latitude) || 33.3152,
      longitude: Number(body.longitude) || 44.3661,
      licenseStatus: body.licenseStatus || "LICENSED",
      licenseExpiryDate: body.licenseExpiryDate || "2027-12-31",
      inspectionStatus: "NEEDS_INSPECTION",
      createdDate: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    facilitiesStore.unshift(newFacility);
    res.status(201).json(newFacility);
  });
  apiRouter.get("/nurses", (req, res) => {
    const { facilityId, search } = req.query;
    let results = [...nursesStore];
    if (facilityId) {
      results = results.filter((n) => n.currentFacilityId === facilityId);
    }
    if (search && typeof search === "string") {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (n) => n.fullName.toLowerCase().includes(q) || n.syndicateId.toLowerCase().includes(q) || n.nationalId.includes(q)
      );
    }
    res.json(results);
  });
  apiRouter.put("/nurses/:id", (req, res) => {
    const { id } = req.params;
    const index = nursesStore.findIndex((n) => n.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "\u0627\u0644\u0643\u0627\u062F\u0631 \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    }
    nursesStore[index] = { ...nursesStore[index], ...req.body };
    res.json(nursesStore[index]);
  });
  apiRouter.post("/nurses", (req, res) => {
    const body = req.body;
    const newNurse = {
      id: `nurse_${Date.now()}`,
      syndicateId: body.syndicateId || `NUR-2026-${Math.floor(100 + Math.random() * 900)}`,
      fullName: body.fullName,
      nationalId: body.nationalId || "",
      specializedTitle: body.specializedTitle || "\u0645\u0645\u0631\u0636 \u062C\u0627\u0645\u0639\u064A",
      qualificationDegree: body.qualificationDegree || "\u0628\u0643\u0627\u0644\u0648\u0631\u064A\u0648\u0633 \u0639\u0644\u0648\u0645 \u0627\u0644\u062A\u0645\u0631\u064A\u0636",
      qualificationName: body.qualificationName || "\u0643\u0644\u064A\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636",
      graduationYear: body.graduationYear || "2020",
      syndicateRegistrationYear: body.syndicateRegistrationYear || "2020",
      bloodType: body.bloodType || "O+",
      syndicateStatus: body.syndicateStatus || "ACTIVE",
      licenseExpiryDate: body.licenseExpiryDate || "2027-12-31",
      currentFacilityId: body.currentFacilityId || "fac_1",
      facilityName: body.facilityName || "\u0645\u0633\u062A\u0634\u0641\u0649 \u0627\u0644\u0643\u0631\u062E \u0627\u0644\u062A\u0645\u0631\u064A\u0636\u064A \u0627\u0644\u0623\u0647\u0644\u064A",
      phone: body.phone || "",
      notes: body.notes || ""
    };
    nursesStore.unshift(newNurse);
    res.status(201).json(newNurse);
  });
  apiRouter.get("/nurses/verify/:syndicateId", (req, res) => {
    const { syndicateId } = req.params;
    const nurse = nursesStore.find((n) => n.syndicateId.toLowerCase() === syndicateId.toLowerCase().trim());
    if (!nurse) {
      return res.json({
        found: false,
        status: "NOT_FOUND",
        message: "\u0631\u0642\u0645 \u0627\u0644\u0627\u0646\u062A\u0633\u0627\u0628 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644 \u0628\u0645\u0644\u0641\u0627\u062A \u0646\u0642\u0627\u0628\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A\u0629! \u062A\u0646\u0628\u064A\u0647: \u0627\u062D\u062A\u0645\u0627\u0644 \u0648\u062C\u0648\u062F \u0647\u0648\u064A\u0629 \u063A\u064A\u0631 \u0645\u0631\u062E\u0635\u0629."
      });
    }
    const isExpired = new Date(nurse.licenseExpiryDate) < /* @__PURE__ */ new Date();
    const activeStatus = isExpired ? "EXPIRED" : nurse.syndicateStatus;
    res.json({
      found: true,
      nurse,
      status: activeStatus,
      isExpired,
      message: activeStatus === "ACTIVE" ? "\u0627\u0644\u0647\u0648\u064A\u0629 \u0627\u0644\u0646\u0642\u0627\u0628\u064A\u0629 \u0633\u0627\u0631\u064A\u0629 \u0627\u0644\u0645\u0641\u0639\u0648\u0644 \u0648\u0645\u0633\u062C\u0644\u0629 \u0623\u0635\u0648\u0644\u064A\u0627\u064B." : `\u062A\u0646\u0628\u064A\u0647: \u062D\u0627\u0644\u0629 \u0627\u0644\u0647\u0648\u064A\u0629 (${activeStatus}) - \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621: ${nurse.licenseExpiryDate}`
    });
  });
  apiRouter.get("/assignments", (req, res) => {
    const { inspectorId, status } = req.query;
    let results = [...assignmentsStore];
    if (inspectorId) {
      results = results.filter((a) => a.assignedInspectorId === inspectorId);
    }
    if (status) {
      results = results.filter((a) => a.status === status);
    }
    res.json(results);
  });
  apiRouter.post("/assignments", (req, res) => {
    const { facilityId, assignedInspectorId, scheduledDate, priority, notes, assignedByUserId } = req.body;
    const facility = facilitiesStore.find((f) => f.id === facilityId);
    const inspector = INITIAL_USERS.find((u) => u.id === assignedInspectorId);
    const assigner = INITIAL_USERS.find((u) => u.id === assignedByUserId) || INITIAL_USERS[3];
    if (!facility) {
      return res.status(400).json({ error: "\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const newAssignment = {
      id: `assign_${Date.now()}`,
      assignmentCode: `INSP-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityAddress: `${facility.neighborhood} - ${facility.addressDetail}`,
      facilityLat: facility.latitude,
      facilityLng: facility.longitude,
      assignedInspectorId: inspector ? inspector.id : assignedInspectorId,
      assignedInspectorName: inspector ? inspector.name : "\u0645\u0641\u062A\u0634 \u0645\u064A\u062F\u0627\u0646\u064A",
      assignedByUserId: assigner.id,
      assignedByUserName: assigner.name,
      scheduledDate: scheduledDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      priority: priority || "MEDIUM",
      status: "PENDING",
      notes: notes || "",
      createdAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    };
    assignmentsStore.unshift(newAssignment);
    facility.inspectionStatus = "NEEDS_INSPECTION";
    facility.assignedInspectorId = inspector?.id;
    res.status(201).json(newAssignment);
  });
  apiRouter.post("/inspections", (req, res) => {
    const {
      assignmentId,
      facilityId,
      inspectorId,
      inspectorName,
      inspectorLat,
      inspectorLng,
      generalComplianceScore,
      checkedNurseIds,
      violations,
      notes,
      photos,
      recommendedAction
    } = req.body;
    const facility = facilitiesStore.find((f) => f.id === facilityId);
    if (!facility) {
      return res.status(404).json({ error: "\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629" });
    }
    const distMeters = calculateGpsDistanceMeters(
      Number(inspectorLat),
      Number(inspectorLng),
      facility.latitude,
      facility.longitude
    );
    const isGpsValidated = distMeters <= 150;
    const reportId = `rep_${Date.now()}`;
    const report = {
      id: reportId,
      assignmentId: assignmentId || "",
      facilityId: facility.id,
      inspectorId: inspectorId || "user_5",
      inspectorName: inspectorName || "\u0639\u0644\u064A \u062D\u0633\u064A\u0646 \u0627\u0644\u0643\u0639\u0628\u064A",
      visitTimestamp: (/* @__PURE__ */ new Date()).toISOString(),
      inspectorLat: Number(inspectorLat),
      inspectorLng: Number(inspectorLng),
      facilityLat: facility.latitude,
      facilityLng: facility.longitude,
      gpsDistanceMeters: distMeters,
      isGpsValidated,
      generalComplianceScore: Number(generalComplianceScore) || 85,
      checkedNursesCount: Array.isArray(checkedNurseIds) ? checkedNurseIds.length : 0,
      violationsCount: Array.isArray(violations) ? violations.length : 0,
      notes: notes || "",
      photos: Array.isArray(photos) ? photos : [],
      checkedNurseIds: Array.isArray(checkedNurseIds) ? checkedNurseIds : [],
      recommendedAction: recommendedAction || "PASS",
      status: "SUBMITTED"
    };
    reportsStore.unshift(report);
    if (Array.isArray(violations) && violations.length > 0) {
      violations.forEach((v) => {
        const newViol = {
          id: `viol_${Date.now()}_${Math.floor(Math.random() * 1e3)}`,
          inspectionReportId: reportId,
          facilityId: facility.id,
          facilityName: facility.name,
          violationType: v.violationType || "OTHER",
          description: v.description || "\u0645\u062E\u0627\u0644\u0641\u0629 \u0645\u0631\u0635\u0648\u062F\u0629 \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u062A\u0641\u062A\u064A\u0634 \u0627\u0644\u0645\u064A\u062F\u0627\u0646\u064A",
          nurseSyndicateId: v.nurseSyndicateId,
          nurseName: v.nurseName,
          severity: v.severity || "WARNING",
          fineAmountIqd: Number(v.fineAmountIqd) || 0,
          status: "PENDING_REVIEW",
          recordedAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        violationsStore.unshift(newViol);
      });
      facility.inspectionStatus = "VIOLATION_RECORDED";
    } else {
      facility.inspectionStatus = "INSPECTED";
    }
    facility.lastInspectionDate = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    if (assignmentId) {
      const assignment = assignmentsStore.find((a) => a.id === assignmentId);
      if (assignment) {
        assignment.status = "COMPLETED";
      }
    }
    res.status(201).json({
      success: true,
      report,
      gpsValidation: {
        distanceMeters: distMeters,
        isValidated: isGpsValidated,
        message: isGpsValidated ? `\u062A\u0645 \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062C\u063A\u0631\u0627\u0641\u064A \u0628\u0646\u062C\u0627\u062D! \u0627\u0644\u0645\u0641\u062A\u0634 \u0645\u062A\u0648\u0627\u062C\u062F \u0636\u0645\u0646 \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0646\u0634\u0623\u0629 (${distMeters} \u0645\u062A\u0631).` : `\u062A\u0646\u0628\u064A\u0647 \u062C\u063A\u0631\u0627\u0641\u064A: \u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0641\u062A\u0634 \u064A\u0628\u0639\u062F ${distMeters} \u0645\u062A\u0631 \u0639\u0646 \u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u0645\u0633\u062C\u0644 \u0644\u0644\u0645\u0646\u0634\u0623\u0629 (\u0627\u0644\u062A\u0633\u0627\u0645\u062D \u0627\u0644\u0645\u0633\u0645\u0648\u062D 150\u0645).`
      }
    });
  });
  apiRouter.get("/violations", (req, res) => {
    res.json(violationsStore);
  });
  apiRouter.get("/stats", (req, res) => {
    const totalFacilities = facilitiesStore.length;
    const totalClinics = facilitiesStore.filter((f) => f.type === "CLINIC").length;
    const totalHospitals = facilitiesStore.filter((f) => f.type === "HOSPITAL").length;
    const totalLicensed = facilitiesStore.filter((f) => f.licenseStatus === "LICENSED").length;
    const totalPending = facilitiesStore.filter((f) => f.licenseStatus === "PENDING").length;
    const totalViolations = violationsStore.length;
    const pendingAssignments = assignmentsStore.filter((a) => a.status === "PENDING").length;
    res.json({
      totalFacilities,
      totalClinics,
      totalHospitals,
      totalLicensed,
      totalPending,
      totalViolations,
      totalActiveNurses: nursesStore.filter((n) => n.syndicateStatus === "ACTIVE").length,
      inspectionsCompletedThisMonth: reportsStore.length + 48,
      pendingAssignments
    });
  });
  apiRouter.get("/schema", (req, res) => {
    res.json({
      sqlScript: SQL_DATABASE_SCHEMA,
      tablesDocs: SCHEMA_TABLES_DOCS
    });
  });
  apiRouter.get("/vouchers", (req, res) => {
    const { provinceId, type, category } = req.query;
    let results = [...vouchersStore];
    if (provinceId && typeof provinceId === "string") {
      results = results.filter((v) => v.provinceId === provinceId);
    }
    if (type && typeof type === "string") {
      results = results.filter((v) => v.voucherType === type);
    }
    if (category && typeof category === "string") {
      results = results.filter((v) => v.category === category);
    }
    res.json(results);
  });
  apiRouter.post("/vouchers", (req, res) => {
    const body = req.body;
    const newVoucher = {
      id: body.id || `vouch_${Date.now()}`,
      voucherNumber: body.voucherNumber || `RV-2026-${Math.floor(1e3 + Math.random() * 9e3)}`,
      voucherType: body.voucherType || "RECEIPT",
      category: body.category || "INSPECTION_FINE",
      amountIqd: Number(body.amountIqd) || 0,
      payerOrBeneficiary: body.payerOrBeneficiary || "\u0627\u0644\u0645\u0646\u0634\u0623\u0629 \u0627\u0644\u0645\u0633\u062F\u062F\u0629",
      facilityId: body.facilityId,
      facilityName: body.facilityName,
      provinceId: body.provinceId || "iq_baghdad",
      provinceName: body.provinceName || "\u0628\u063A\u062F\u0627\u062F",
      date: body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      paymentMethod: body.paymentMethod || "ELECTRONIC_QI",
      referenceNumber: body.referenceNumber || `TX-${Date.now().toString().slice(-6)}`,
      treasuryFund: body.treasuryFund || "INSPECTION_FUND",
      status: body.status || "COLLECTED",
      issuedByUserId: body.issuedByUserId || "user_1",
      issuedByUserName: body.issuedByUserName || "\u062F. \u0641\u0631\u0627\u0633 \u0627\u0644\u0645\u0648\u0633\u0648\u064A",
      notes: body.notes || ""
    };
    vouchersStore.unshift(newVoucher);
    res.status(201).json(newVoucher);
  });
  apiRouter.get("/budgets", (req, res) => {
    res.json(branchBudgetsStore);
  });
  apiRouter.get("/chat/messages", (req, res) => {
    const { channelId } = req.query;
    if (channelId && typeof channelId === "string") {
      res.json(chatMessagesStore.filter((m) => m.channelId === channelId));
    } else {
      res.json(chatMessagesStore);
    }
  });
  apiRouter.post("/chat/messages", (req, res) => {
    const body = req.body;
    const newMsg = {
      id: body.id || `msg_${Date.now()}`,
      channelId: body.channelId || "general-ops",
      senderId: body.senderId || "user_1",
      senderName: body.senderName || "\u0627\u0644\u0646\u0642\u064A\u0628",
      senderRole: body.senderRole || "HIGH_COMMAND",
      senderBadge: body.senderBadge || "INS-001",
      provinceId: body.provinceId,
      provinceName: body.provinceName,
      messageText: body.messageText || "",
      timestamp: body.timestamp || (/* @__PURE__ */ new Date()).toISOString().replace("T", " ").slice(0, 16),
      type: body.type || "TEXT",
      attachment: body.attachment
    };
    chatMessagesStore.push(newMsg);
    res.status(201).json(newMsg);
  });
  apiRouter.get("/broadcasts", (req, res) => {
    res.json(broadcastsStore);
  });
  apiRouter.post("/broadcasts", (req, res) => {
    const body = req.body;
    const newBrd = {
      id: body.id || `brd_${Date.now()}`,
      code: body.code || `CIRC-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: body.title,
      summary: body.summary,
      urgency: body.urgency || "URGENT",
      issuedBy: body.issuedBy || "\u0645\u062C\u0644\u0633 \u0646\u0642\u0627\u0628\u0629 \u0627\u0644\u062A\u0645\u0631\u064A\u0636 \u0627\u0644\u0639\u0631\u0627\u0642\u064A\u0629",
      targetScope: body.targetScope || "ALL_BRANCHES",
      targetProvinceId: body.targetProvinceId,
      issueDate: body.issueDate || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      actionRequired: body.actionRequired || "\u0627\u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u0641\u0648\u0631\u064A \u0644\u0644\u0645\u0633\u062D \u0627\u0644\u062A\u0641\u062A\u064A\u0634\u064A",
      isActive: true
    };
    broadcastsStore.unshift(newBrd);
    res.status(201).json(newBrd);
  });
  app.use("/api", apiRouter);
  mobileApp.use("/api", apiRouter);
  let vite = null;
  if (process.env.NODE_ENV !== "production") {
    vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "custom"
    });
  }
  if (vite) {
    app.use(vite.middlewares);
    mobileApp.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    mobileApp.use(import_express.default.static(distPath));
  }
  mobileApp.use("*", async (req, res, next) => {
    try {
      if (vite) {
        const filePath = import_path.default.join(process.cwd(), "mobile.html");
        let html = import_fs.default.readFileSync(filePath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).send(html);
      } else {
        res.sendFile(import_path.default.join(process.cwd(), "dist", "mobile.html"));
      }
    } catch (err) {
      next(err);
    }
  });
  app.use("*", async (req, res, next) => {
    try {
      if (vite) {
        const pathname = req.path;
        if (pathname.startsWith("/login")) {
          const filePath2 = import_path.default.join(process.cwd(), "login.html");
          let html2 = import_fs.default.readFileSync(filePath2, "utf-8");
          html2 = await vite.transformIndexHtml(req.originalUrl, html2);
          return res.status(200).set({ "Content-Type": "text/html" }).send(html2);
        }
        if (pathname.startsWith("/mobile")) {
          const filePath2 = import_path.default.join(process.cwd(), "mobile.html");
          let html2 = import_fs.default.readFileSync(filePath2, "utf-8");
          html2 = await vite.transformIndexHtml(req.originalUrl, html2);
          return res.status(200).set({ "Content-Type": "text/html" }).send(html2);
        }
        if (pathname.startsWith("/inspector")) {
          const filePath2 = import_path.default.join(process.cwd(), "inspector.html");
          let html2 = import_fs.default.readFileSync(filePath2, "utf-8");
          html2 = await vite.transformIndexHtml(req.originalUrl, html2);
          return res.status(200).set({ "Content-Type": "text/html" }).send(html2);
        }
        const filePath = import_path.default.join(process.cwd(), "index.html");
        let html = import_fs.default.readFileSync(filePath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).send(html);
      } else {
        const pathname = req.path;
        if (pathname.startsWith("/login")) {
          return res.sendFile(import_path.default.join(process.cwd(), "dist", "login.html"));
        }
        if (pathname.startsWith("/mobile")) {
          return res.sendFile(import_path.default.join(process.cwd(), "dist", "mobile.html"));
        }
        if (pathname.startsWith("/inspector")) {
          return res.sendFile(import_path.default.join(process.cwd(), "dist", "inspector.html"));
        }
        res.sendFile(import_path.default.join(process.cwd(), "dist", "index.html"));
      }
    } catch (err) {
      next(err);
    }
  });
  try {
    mobileApp.listen(4e3, "0.0.0.0", () => {
      console.log(`Mobile App Simulator running on http://0.0.0.0:4000`);
    });
  } catch (err) {
    console.warn("Could not bind port 4000 (accessible via port 3000 /mobile):", err);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Iraqi Nursing Syndicate Inspection System server running on http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
//# sourceMappingURL=server.cjs.map
