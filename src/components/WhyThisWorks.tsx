export default function WhyThisWorks() {
    const points = [
        {
            title: 'Consistency Beats Timing',
            description:
                'Trying to time the market is nearly impossible. Regular, scheduled investments remove emotion from the equation and ensure you stay invested through all market conditions.',
        },
        {
            title: 'Volatility is Normal',
            description:
                'Stock prices fluctuate daily—that\'s normal. With SIP, you buy more shares when prices are low and fewer when high, naturally averaging your cost over time.',
        },
        {
            title: 'Stable Companies Reward Patience',
            description:
                'Quality companies with strong fundamentals tend to grow over time. Patience and consistency in investing in such companies has historically been rewarded.',
        },
    ];

    return (
        <div className="glass-card p-8 md:p-10">
            <h3 className="text-2xl font-bold mb-8 tracking-tight">
                Why This Strategy Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {points.map((point, index) => (
                    <div
                        key={point.title}
                        className="fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <h4 className="font-semibold mb-3 text-[var(--color-text-primary)] text-lg">
                            {point.title}
                        </h4>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                            {point.description}
                        </p>
                    </div>
                ))}
            </div>
            <div className="mt-8 pt-8 border-t border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-muted)] italic leading-relaxed">
                    This strategy invests the same amount monthly regardless of price. Over long horizons, consistency matters more than timing.
                </p>
            </div>
        </div>
    );
}
