document.addEventListener("DOMContentLoaded", () => {
    // ✅ User Registration Stats Chart
    const userChartCtx = document.getElementById("userStatsChart").getContext("2d");
    new Chart(userChartCtx, {
        type: "bar",
        data: {
            labels: userStats.map(stat => `Month ${stat._id}`),
            datasets: [{
                label: "New Users",
                data: userStats.map(stat => stat.count),
                backgroundColor: "rgba(54, 162, 235, 0.5)"
            }]
        }
    });

    // ✅ Product Categories Pie Chart
    const categoryChartCtx = document.getElementById("categoryChart").getContext("2d");
    const colors = ["#ff6384", "#36a2eb", "#ffce56", "#4caf50", "#9966ff", "#ff9f40"];
    
    new Chart(categoryChartCtx, {
        type: "pie",
        data: {
            labels: categoryStats.map(stat => stat._id),
            datasets: [{
                data: categoryStats.map(stat => stat.count),
                backgroundColor: colors.slice(0, categoryStats.length)
            }]
        }
    });

    // ✅ Total Sales Calculation & Display
    const totalSales = salesStats.reduce((sum, stat) => sum + stat.sales, 0); // Calculate total sales
    document.querySelector(".card:nth-child(4) strong").innerText = `₹${totalSales.toLocaleString()}`;

    // ✅ Sales Statistics Chart
    const salesChartCtx = document.getElementById("salesChart").getContext("2d");
    new Chart(salesChartCtx, {
        type: "line",
        data: {
            labels: salesStats.map(stat => `Month ${stat._id}`),
            datasets: [{
                label: "Total Sales (₹)",
                data: salesStats.map(stat => stat.sales),
                backgroundColor: "rgba(255, 99, 132, 0.5)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Total Sales (₹)"
                    }
                }
            }
        }
    });
});
