// CMS JSON is the source of truth. Build validation excludes drafts and checks
// Georgian clinical fields, reviewed sources, unique routes and image files.
import { records, sourceRecords } from "./generated-content.js";
export const products = records;
export const sources = sourceRecords;
