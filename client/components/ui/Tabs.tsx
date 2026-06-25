type TabItem<TValue extends string> = {
  value: TValue;
  label: string;
};

type TabsProps<TValue extends string> = {
  items: Array<TabItem<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
};

export default function Tabs<TValue extends string>({ items, value, onChange }: TabsProps<TValue>) {
  return (
    <div className="flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`h-10 min-w-24 rounded-md px-4 text-sm font-semibold transition sm:min-w-28 ${
            value === item.value ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
