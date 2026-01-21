import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

type PriceHistoryItem = {
    price: string;
    createdAt: string;
};

type Props = {
    data: PriceHistoryItem[];
};

export default function PriceHistoryChart({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center rounded-3xl bg-gray-800/30 border border-gray-700/50">
                <p className="font-bold text-gray-500">No price history available</p>
            </div>
        );
    }

    const formattedData = data.map((item, index) => ({
        price: parseFloat(item.price),
        date: new Date(item.createdAt).toLocaleDateString(),
        fullDate: new Date(item.createdAt).toLocaleString(),
        // Add unique key for XAxis to handle multiple sales on same day
        uniqueId: `${item.createdAt}-${index}`
    }));

    return (
        <div className="h-80 w-full rounded-[40px] bg-gray-800/30 border border-gray-700/50 p-6 backdrop-blur-sm">
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={formattedData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                        <XAxis
                            dataKey="uniqueId"
                            tickFormatter={(value) => {
                                // Find the item to display the date
                                const item = formattedData.find(d => d.uniqueId === value);
                                return item ? item.date : '';
                            }}
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fontSize: 10, fontWeight: 700 }}
                            dy={10}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `${value} CINT`}
                            tick={{ fontSize: 10, fontWeight: 700 }}
                            dx={-10}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="rounded-2xl bg-gray-900 border border-gray-700 p-4 shadow-xl">
                                            <p className="mb-1 text-[10px] font-black uppercase text-gray-500">{payload[0].payload.fullDate}</p>
                                            <p className="text-xl font-black text-blue-400">
                                                {payload[0].value} CINT
                                            </p>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Line
                            type="monotone"
                            dataKey="price"
                            stroke="#3B82F6"
                            strokeWidth={3}
                            dot={{ r: 4, strokeWidth: 2, stroke: '#3B82F6', fill: '#1F2937' }}
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
