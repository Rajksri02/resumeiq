import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

const ScoreGauge = ({ score }) => {
  let color = '#ef4444'; // red
  if (score >= 75) color = '#22c55e'; // green
  else if (score >= 50) color = '#f59e0b'; // amber

  const data = [{ name: 'Score', value: score, fill: color }];

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <RadialBarChart
        width={200}
        height={200}
        cx={100}
        cy={100}
        innerRadius={70}
        outerRadius={90}
        barSize={15}
        data={data}
        startAngle={90}
        endAngle={-270}
      >
        <PolarAngleAxis
          type="number"
          domain={[0, 100]}
          angleAxisId={0}
          tick={false}
        />
        <RadialBar
          background
          clockWise
          dataKey="value"
          cornerRadius={10}
        />
      </RadialBarChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-800">{score}</span>
        <span className="text-sm text-gray-500 font-medium">ATS Score</span>
      </div>
    </div>
  );
};

export default ScoreGauge;
