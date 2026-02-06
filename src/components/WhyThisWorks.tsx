export default function WhyThisWorks() {
    const points = [
        {
            icon: '🎯',
            title: 'Consistency Beats Timing',
            description:
                'Trying to time the market is nearly impossible. Regular, scheduled investments remove emotion from the equation and ensure you stay invested through all market conditions.',
        },
        {
            icon: '📊',
            title: 'Volatility is Normal',
            description:
                'Stock prices fluctuate daily—that\'s normal. With SIP, you buy more shares when prices are low and fewer when high, naturally averaging your cost over time.',
        },
        {
            icon: '🏆',
            title: 'Stable Companies Reward Patience',
            description:
                'Quality companies with strong fundamentals tend to grow over time. Patience and consistency in investing in such companies has historically been rewarded.',
        },
    ];

    return (
        <div className="glass-card p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                💡 Why This Strategy Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {points.map((point, index) => (
                    <div
                        key={point.title}
                        className="p-4 bg-[var(--color-bg-tertiary)] rounded-xl fade-in"
                        style={{ animationDelay: `${index * 0.15}s` }}
                    >
                        <div className="text-3xl mb-3">{point.icon}</div>
                        <h4 className="font-semibold mb-2 text-[var(--color-text-primary)]">
                            {point.title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {point.description}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-6 p-4 bg-gradient-to-r from-[var(--color-bg-tertiary)] to-[var(--color-bg-secondary)] rounded-lg border-l-4 border-[var(--color-primary)]">
                <p className="text-sm text-[var(--color-text-secondary)] italic">
                    "This strategy invests the same amount monthly regardless of price. Over long horizons, consistency matters."
                </p>
            </div>
        </div>
    );
}
