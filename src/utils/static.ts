import { CloseBold, Select, Star } from "@element-plus/icons-vue";

export const pub_options = [
  {
    label: "全部状态",
    value: 2,
    icon: Star,
    class: "text-blue-500 w-4 h-4",
  },
  {
    label: "未发布",
    value: 0,
    icon: CloseBold,
    class: "text-gray-500 w-4 h-4",
  },
  {
    label: "已发布",
    value: 1,
    icon: Select,
    class: "text-green-500 w-4 h-4",
  },
];

export const status_fields_short = ["翻", "校", "嵌", "审"];