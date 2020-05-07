;(() => {
    let weekData, monthData, allData
    const apiUrl = "http://104.248.147.97/"
    const userID = document.body
        .querySelector("#user_id")
        .getAttribute("data-user-id")
    const urlMonth = `${apiUrl}api/users/balance/changes/${userID}/1month`
    const urlWeek = `${apiUrl}api/users/balance/changes/${userID}/1week`
    const urlAll = `${apiUrl}api/users/balance/changes/${userID}/all`
    let switchButtons = document.querySelectorAll("input[name='time-period']")
    function getChartData(params) {
        axios
            .get(urlWeek)
            .then(function(response) {
                weekData = response.data.map(data => {
                    data.date = moment(data).format("YYYY-MM-DD")
                    data.amount = data.amount
                    return data
                })
                renderChart(weekData)
            })
            .catch(function(error) {
                console.log(error)
            })
        axios
            .get(urlMonth)
            .then(function(response) {
                monthData = response.data.map(data => {
                    data.date = moment(data).format("YYYY-MM-DD")
                    data.amount = data.amount
                    return data
                })
            })
            .catch(function(error) {
                console.log(error)
            })
        axios
            .get(urlAll)
            .then(function(response) {
                allData = response.data.map(data => {
                    data.date = moment(data).format("YYYY-MM-DD")
                    data.amount = data.amount
                    return data
                })
            })
            .catch(function(error) {
                console.log(error)
            })
    }
    getChartData()
    switchButtons.forEach(btn => {
        btn.addEventListener("change", e => {
            if (btn.id === "month") {
                // console.log(monthData, "month")
                renderChart(monthData)
            }
            if (btn.id === "all") {
                // console.log(allData, "all")
                renderChart(allData)
            }
            if (btn.id === "week") {
                // console.log(weekData, "week")
                renderChart(weekData)
            }
        })
    })
    function renderChart(data, e) {
        am4core.ready(function() {
            // Themes begin
            am4core.useTheme(am4themes_animated)
            // Themes end

            // Create chart instance
            var chart = am4core.create("js_chart_box", am4charts.XYChart)

            // Add data
            chart.data = data
            // Set input format for the dates
            // chart.dateFormatter.inputDateFormat = "dd-MM-YYYY";
            chart.dateFormatter.DateFormat = "yyyy-MM-dd"

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis())

            dateAxis.renderer.grid.template.location = 0
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis())
            // Create series
            var series = chart.series.push(new am4charts.LineSeries())
            series.dataFields.valueY = "amount"
            series.dataFields.dateX = "date"
            series.tooltipText = "{amount}"
            series.strokeWidth = 4
            series.minBulletDistance = 30

            // Drop-shaped tooltips
            series.tooltip.background.cornerRadius = 10
            series.tooltip.background.strokeOpacity = 0
            series.tooltip.pointerOrientation = "vertical"
            series.tooltip.label.minHeight = 20
            series.tooltip.label.fontSize = 10
            series.tooltip.label.textAlign = "middle"
            series.tooltip.label.textValign = "middle"

            // Make bullets grow on hover
            var bullet = series.bullets.push(new am4charts.CircleBullet())
            bullet.circle.strokeWidth = 2
            bullet.circle.radius = 4
            bullet.circle.fill = am4core.color("#fff")

            var bullethover = bullet.states.create("hover")
            bullethover.properties.scale = 1.3

            // Make a panning cursor
            chart.cursor = new am4charts.XYCursor()
            chart.cursor.behavior = "panXY"
            chart.cursor.xAxis = dateAxis
            chart.cursor.snapToSeries = series
            chart.scrollbarX = new am4core.Scrollbar()
            chart.scrollbarX.background.fill = am4core.color("#6dcff6")
            chart.scrollbarX.marginBottom = 30
            chart.scrollbarX.showSystemTooltip = false
            chart.scrollbarX.thumb.showSystemTooltip = false
            chart.scrollbarX.thumb.hoverable = false
            chart.scrollbarX.thumb.background.fill = am4core.color("#20C4F4")
            chart.scrollbarX.thumb.background.states.getKey(
                "hover",
            ).properties.fill = am4core.color("#20C4F4")
            chart.scrollbarX.thumb.background.states.getKey(
                "hover",
            ).properties.fillOpacity = 0.7
            chart.scrollbarX.thumb.background.states.getKey(
                "down",
            ).properties.fill = am4core.color("#20C4F4")
            chart.scrollbarX.thumb.background.states.getKey(
                "down",
            ).properties.fillOpacity = 0.7
            chart.scrollbarX.startGrip.showSystemTooltip = false
            chart.scrollbarX.endGrip.showSystemTooltip = false
            dateAxis.start = 0
            dateAxis.keepSelection = true
            valueAxis.events.on("ready", function(ev) {
                ev.target.min = ev.target.min
                ev.target.max = ev.target.max
            })
            function customizeGrip(grip) {
                // Remove default grip image
                grip.icon.disabled = true

                // Disable background
                grip.background.disabled = true

                // Add rotated rectangle as bi-di arrow
                var img = grip.createChild(am4core.Circle)
                img.width = 15
                img.height = 15
                img.fill = am4core.color("#ed193e")
                img.rotation = 45
                img.align = "center"
                img.valign = "middle"

                // Add vertical bar
                var line = grip.createChild(am4core.Circle)
                line.height = 10
                line.width = 10
                line.fill = am4core.color("#ed193e")
                line.align = "center"
                line.valign = "middle"
            }
            customizeGrip(chart.scrollbarX.startGrip)
            customizeGrip(chart.scrollbarX.endGrip)
        }) // end am4core.ready()
    }
})()
