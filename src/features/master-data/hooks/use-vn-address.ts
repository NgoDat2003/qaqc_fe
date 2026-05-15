// Vietnam administrative divisions — post-2025 merger data
// Source: https://github.com/zuydd/vn-geo (34 provinces, wards directly under province)
// After the 2025 merger, districts (quận/huyện) were eliminated — structure is Province → Ward

import vnTree from "@/lib/vn-geo/vn-tree.json";
import type { ComboboxOption } from "@/shared/components/combobox-input";

interface Ward {
  code: string;
  name: string;
  fullName: string;
  slug: string;
  type: string;
}

interface Province {
  code: string;
  name: string;
  fullName: string;
  wards: Ward[];
}

const PROVINCES = vnTree as Province[];

export function getProvinceOptions(): ComboboxOption[] {
  return PROVINCES.map((p) => ({ value: p.name, label: p.fullName }));
}

export function getWardOptions(provinceName: string): ComboboxOption[] {
  const province = PROVINCES.find((p) => p.name === provinceName);
  return province?.wards.map((w) => ({ value: w.name, label: w.fullName })) ?? [];
}

// Pre-built province map for O(1) lookup
const PROVINCE_MAP = new Map(PROVINCES.map((p) => [p.name, p]));

export function getWardOptionsForProvince(provinceName: string): ComboboxOption[] {
  const province = PROVINCE_MAP.get(provinceName);
  return province?.wards.map((w) => ({ value: w.name, label: w.fullName })) ?? [];
}
