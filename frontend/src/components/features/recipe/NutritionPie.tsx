import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export interface NutritionData {
  total_ingredients: number;
  avg_calories: number;
  avg_proteins: number;
  avg_carbs: number;
  avg_fat: number;
  total: number;
}

export default function NutritionPie({
  nutrition,
}: {
  nutrition: NutritionData;
}) {
  const macros = [
    {
      key: "carbs",
      label: "Carbohidratos",
      color: "#46999F",
      value: nutrition?.avg_carbs,
    },
    {
      key: "fat",
      label: "Grasas",
      color: "#EE7D5F",
      value: nutrition?.avg_fat,
    },
    {
      key: "proteins",
      label: "Proteínas",
      color: "#FDC343",
      value: nutrition?.avg_proteins,
    },
  ];

  console.log(nutrition);

  return (
    <section className="flex flex-col gap-y-4">
      <h2 className="text-[20px] font-bold text-text-5">
        Información Nutricional Aproximada
      </h2>

      <article className="flex flex-col gap-y-4 items-center px-6 py-4 rounded-[10px] border border-gray-200 border-dashed w-full">
        <div className="relative w-full h-[160px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart className="[&_*]:outline-none">
              <Pie
                data={[...macros]}
                paddingAngle={8}
                isAnimationActive={true}
                innerRadius="75%"
                cornerRadius={999}
                outerRadius="95%"
                dataKey="value"
                labelLine={false}
              >
                {macros.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute pointer-events-none flex flex-col items-center justify-center text-center">
            <span className="font-bold text-text-3 text-[24px] leading-none">
              {Number(nutrition.avg_calories).toFixed(0)}
            </span>
            <span className="text-text-6 text-[14px] mt-1">Cals</span>
          </div>
        </div>

        <div className="flex flex-row flex-wrap justify-between gap-x-4 w-full">
          {macros.map(({ key, label, color, value }) => {
            return (
              <div
                key={key}
                className="flex flex-col gap-y-0.5 items-center flex-1"
              >
                <span className="font-bold text-[14px]" style={{ color }}>
                  {value && nutrition?.total
                    ? ((Number(value) / nutrition.total) * 100).toFixed(0)
                    : 0}
                  %
                </span>
                <span className="text-text-5 text-[18px] font-bold">
                  {value ? Number(value).toFixed(1) : "0"}g
                </span>
                <span className="text-text-6 text-[14px]">{label}</span>
                <div
                  className="w-full h-[4px] rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            );
          })}
        </div>
      </article>
    </section>
  );
}
