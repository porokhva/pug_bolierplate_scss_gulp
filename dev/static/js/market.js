document.addEventListener('DOMContentLoaded', function() {
	// load a locale
	// numeral.language('ru');
	// запрет на изменение значения инпута при прокручивании колеса

	inputsSettings()
	moment.locale('ru')
	defaultLoadPage()
	getUserBalance()
	connect()
	calcEnteredPrice()

})



async function connect() {

	let socket = await new SockJS('http://104.248.147.97/market');
	
	let isConnected

	if (isConnected) {
		stompClient.reconnect_delay = 5000;
		stompClient.subscribe('/topic/trade',  function (response) {
			// console.log('Обновление по трейдам: ');
			// console.log(message.body)
			
			let dataCopy = JSON.parse(JSON.stringify(response.body))
			fillerTradesHistory(dataCopy)
		});

		stompClient.subscribe('/topic/order',  function (response) {
			// console.log('Обновление по ордерам: ');
			// filler(message)
			
			let dataCopy = JSON.parse(JSON.stringify(response.body))
			fillerOrders(dataCopy)
		});

		stompClient.subscribe('/topic/course',  function (response) {
			
			let dataCopy = JSON.parse(JSON.stringify(response.body))
			fillerCourse(dataCopy)
			
		});
		

	} else {
		let stompClient = Stomp.over(socket);
		stompClient.debug = null
		stompClient.reconnect_delay = 5000;
		isConnected = true;
		stompClient.connect({}, () => {

			stompClient.subscribe('/topic/trade',  function (response) {
				// console.log('Обновление по трейдам: ');
				let dataCopy = JSON.parse(JSON.stringify(response.body))
				fillerTradesHistory(dataCopy)
			});

			stompClient.subscribe('/topic/order',  function (response) {
				// console.log('Обновление по ордерам: ');
				
				let dataCopy = JSON.parse(JSON.stringify(response.body))
				fillerOrders(dataCopy)
				
				console.log(JSON.parse(response.body))

			});

			stompClient.subscribe('/topic/course',  function (response) {
				let dataCopy = JSON.parse(JSON.stringify(response.body))
				fillerCourse(dataCopy)
				getCurrencyPair()
			});

			
		}, () => {
			alert('Отсутствует доступ в интернет.Проверьте соединение с сетью')
		});

		
	}
}


function fillerTradesHistory(data) {
	
	
	let dataCopySorted = JSON.parse(data).sort((a, b)=>{
		let startTimeA = new Date(a['originalOrder']['closedAt'].replace(/\s+/g,''));
		let startTimeB = new Date(b['originalOrder']['closedAt'].replace(/\s+/g,''));
		return startTimeB.getTime() - startTimeA.getTime();
	})


	for( let prop in dataCopySorted){
		
		let price = dataCopySorted[prop].originalOrder.price.toFixed(8),
			amount = dataCopySorted[prop].originalOrder.amount.toFixed(8),
			date = dataCopySorted[prop].originalOrder.closedAt,
			typeTrade = dataCopySorted[prop].originalOrder.type,
			type,
			color;

		if(typeTrade == "SELL"){
			type = "Продажа"
			color = "red"
		}
		else{
			type = "Покупка"
			color = "green"
		}	

		renderTradesHistory(price, amount, date, type, color)

		function renderTradesHistory(price, amount, date, type, color)  {
			let dataColumn = document.body.querySelector(`div[data-table="history"]`)
			let dateFull = moment(date).format("LT DD.MM.YYYY")
			let dateHours = moment(date).format("LTS")
			
			
			let infoRow = document.createElement('div')
			infoRow.className = `table-body__row history ${color}`
			infoRow.setAttribute("title", `${dateFull}`)
			infoRow.innerHTML = `
				<div class="text-dark table-body__item time">${dateHours}</div>
				<div class="table-body__item type">${type}</div>
				<div class="table-body__item price">${price}</div>
				<div class="table-body__item amount">${amount}</div>
			`
			dataColumn.appendChild(infoRow)
		}
	}
}



function fillerOrders(data) {
	console.log('qqqqqq')
	// сорутируем по последним
	let dataCopy = JSON.parse(data)
	// console.log(dataCopy.length)

	let dataCopySorted = dataCopy.sort((a, b)=>{
		let startTimeA = new Date(a['createdAt'].replace(/\s+/g,''));
		let startTimeB = new Date(b['createdAt'].replace(/\s+/g,''));
		return startTimeA.getTime() - startTimeB.getTime();
	})

	for( let prop in dataCopySorted){
	
		let price = dataCopySorted[prop].price.toFixed(8),
			amount = dataCopySorted[prop].amount.toFixed(8),
			date = moment(dataCopySorted[prop].createdAt).format("LTS"),
			typeOrder = dataCopySorted[prop].type,
			counterSum = (price * amount).toFixed(8);
			renderOrdersRow(price, amount, date, typeOrder, counterSum)
	}

	function renderOrdersRow(price, amount, date, typeOrder, counterSum)  {

		// price = numeral(price).format('0.[00000000]')

		let dataColumn,
			infoRow = document.createElement('div'),
			baseBuyPrice = document.body.querySelector("#form_buy_base_price"),
			baseBuyPriceTitle = document.body.querySelector("#buy_base_price"),
			baseSellPrice = document.body.querySelector("#form_sell_base_price"),
			baseSellPriceTitle = document.body.querySelector("#sell_base_price");
			
		if(typeOrder === "SELL"){
			dataColumn= document.body.querySelector(`div[data-table="SELL"]`)
			infoRow.className = `table-body__row orders js_order_sell`
			infoRow.setAttribute('title', `${date} Цена: ${price}, Количество: ${amount},`)
			infoRow.setAttribute('data-price', `${price}`)
			infoRow.setAttribute('data-amount', `${amount}`)
			infoRow.setAttribute('data-counter-sum', `${counterSum}`)
			baseBuyPrice.setAttribute("value",`${price}`) 
			baseBuyPrice.value = price
			baseBuyPrice.dispatchEvent(new Event('input'))
			baseBuyPriceTitle.innerText = `${price}`
		}
		else if(typeOrder == "BUY"){
			dataColumn = document.body.querySelector(`div[data-table="BUY"]`)
			infoRow.className = `table-body__row orders js_order_buy js_fill_form`
			infoRow.setAttribute('title', `${date} Цена: ${price}, Количество: ${amount},`)
			infoRow.setAttribute('data-price', `${price}`)
			infoRow.setAttribute('data-amount', `${amount}`)
			infoRow.setAttribute('data-counter-sum', `${counterSum}`)
			baseSellPrice.setAttribute("value",`${price}`) 
			baseSellPrice.value = price
			baseBuyPrice.dispatchEvent(new Event('input'))
			baseSellPriceTitle.innerText = `${price}`
			
		}
		
		infoRow.innerHTML = `
			<div class="table-body__item price">${price}</div>
			<div class="table-body__item amount">${amount}</div>
			<div class="table-body__item counterSum">${counterSum}</div>
		`
		dataColumn.appendChild(infoRow)
	}
}


function fillerCourse(data) {
	let dataCopyObject = JSON.parse(data)
	


	for( let prop in dataCopyObject){

		let info

		if (prop === "cpn"){
			info = dataCopyObject[prop]
			renderCourse(info, prop)
		}
		if (prop === "bsv"){
			info = dataCopyObject[prop]
			renderCourse(info, prop)
		}
		if (prop === "brdi"){
			info = dataCopyObject[prop]
			renderCourse(info,  prop)
		}
		if (prop === "ucp"){
			info = dataCopyObject[prop]
			renderCourse(info, prop)
		}
		if (prop === "rcp"){
			info = dataCopyObject[prop]
			renderCourse(info, prop)
		}
		if (prop === "kcp"){
			info = dataCopyObject[prop]
			renderCourse(info, prop)
		}
	}
	function renderCourse(info, valute){

		// добавление анимации каждому обновленному значению
		animate(valute)

		let dataColumn = document.body.querySelector(`div[data-valute-column="${valute}"]`)
		
		for(let item in info){
			let value = info[item].toFixed(8)
			let currency
			if(item === "cpn"){
				currency = "CPnew"
			}
			else if(item === "bsv"){
				currency = "BSnew"
			}
			else{
				currency = item.toUpperCase()
			}
			let infoRow = document.createElement('div')
			infoRow.className = "table-body__row tokens js_token_pair animr"
			infoRow.setAttribute("data-valute-base",`${valute}`)
			infoRow.setAttribute("data-valute-counter",`${item}`)
			infoRow.innerHTML = `
				<div class="table-body__item valute">${currency}</div>
				<div class="table-body__item value">${value}</div>
				<div class="table-body__item percent">0</div>
				<div class="table-body__item turn">0</div>
			`
			dataColumn.appendChild(infoRow)
		}
	}
	function animate(valute){
		let text = valute
		let dataHead = document.body.querySelector(`div.valute[data-valute-base="${text}"]`)
		dataHead.classList.add('animb')
	}
	function animateRemove(){
		let currencyRow = document.body.querySelectorAll('.js_token_pair');
		let dataHeadItems = document.body.querySelectorAll(`.base-market > .valute`)
		currencyRow.forEach(item => {	item.classList.remove('animr')})
		dataHeadItems.forEach(item => {	item.classList.remove('animb')})
	}
	//удаление анимации через 600мс, после того как она отобразится
	setTimeout(animateRemove, 600)
}




async function getUserBalance(){
	let userID = document.body.querySelector("#user_id").getAttribute("data-user-id")

	axios.get(`http://104.248.147.97/api/balance/${userID}`)
		.then(await function (response) {
			if(response.status === 200){
				let userBalance = JSON.parse(JSON.stringify(response.data))
				// console.log(userBalance)
				renderBalanceFunction(userBalance)
			}
		})
		.catch(function (error){
			console.log(error)
		})
}

function renderBalanceFunction(info){
	let dataColumn = document.body.querySelector("#user_balance_column")

		for(let item in info){
			// console.log(item)
			// console.log(info[item].balance)
			let value = +info[item].balance,
				currency;

			if(item === "cpn"){
				currency = "CPnew"
			}
			else if(item === "bsv"){
				currency = "BSnew"
			}
			else{
				currency = item.toUpperCase()
			}
			
			let infoRow = document.createElement('div')
			infoRow.className = "table-body__row"
			infoRow.setAttribute("data-valute-currency",`${currency}`)
			infoRow.innerHTML = `
				<div class="table-body__item valute">${currency}</div>
				<div class="table-body__item value">${value.toFixed(8)}</div>
			`
			dataColumn.appendChild(infoRow)
		}
}







const getCurrencyPair = () => {
	// получаем пару валют при клике на валюту в колонке "Токены"
	let currencyRow = document.body.querySelectorAll('.js_token_pair');

	for (let i = 0; i < currencyRow.length; i++) {
		const row = currencyRow[i];
		row.addEventListener('click',function(e){
			e.stopPropagation()
			let pair
			let base = row.getAttribute("data-valute-base");
			let counter = row.getAttribute("data-valute-counter");
			pair = `${base}-${counter}`.toUpperCase();
			updatePage(pair)
		})
	}
}


function updatePage(pair){
	// обновляем пару валют и вызываем здесь все функции обновления данных
	const savedPair = pair
	// получение данных и отрисовка чарта
	getChartData(savedPair)
}

function defaultLoadPage(){
	// по дефолоту всё подргужается с этой парой валют
	const defaultPair = "CPN-BRDI";
	// получение данных и отрисовка чарта
	getChartData(defaultPair)
}






async function getChartData(pair){

	const currencyPair = pair;
	// возможные варианты для получения дат

	const dateNow = moment().format('DD-MM-YYYY')
	const dateDayLater = moment().add(-1, "day").format('DD-MM-YYYY')
	const dateMonthLater = moment().add(-1, "month").format('DD-MM-YYYY')
	const dateThreeMonthLater = moment().add(-3, "month").format('DD-MM-YYYY')
	const dateSixMonthLater = moment().add(-6, "month").format('DD-MM-YYYY')
	
		
	const url = 'http://104.248.147.97/api/v1/chart'
	
	let responseData

	axios.get(
			url,
			{
				params:{
					tokenPair: `${currencyPair}`,
					from: `${dateMonthLater}`,
					to: `${dateNow}`
				}
				
			}
		)
		.then( await function (response) {
			// responseData = response.data
			// console.log(responseData);

			// надо отсортировать данные
			let sortedData = filterByDate(response.data)

			// при получении данных рендерим чарт
			renderChart(sortedData)
		})
		.catch(function (error) {
			console.log(error);
		})
		.finally(function () {
			// always executed
		});	
}


function renderChart(newData){

	am4core.ready(function() {

		am4core.useTheme(am4themes_animated);

		var chart = am4core.create("chart", am4charts.XYChart);

			chart.paddingRight = 20;
			chart.dateFormatter.dateFormat = "M-d";
			chart.language.locale["_date_month"] = "M";
	
		var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
			dateAxis.renderer.grid.template.location = 1;
			dateAxis.renderer.minGridDistance = 100;
			dateAxis.dateFormats.setKey("month", "M");
			dateAxis.periodChangeDateFormats.setKey("month", "M");
		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
			valueAxis.tooltip.disabled = true;
	
		var series = chart.series.push(new am4charts.CandlestickSeries());
			series.dataFields.dateX = "dateInterval";
			series.dataFields.valueY = "close";
			series.dataFields.openValueY = "open";
			series.dataFields.lowValueY = "low";
			series.dataFields.highValueY = "high";
			series.tooltipText = `Open: {openValueY.value} [bold] [/]\nLow: {lowValueY.value} [bold] [/]\nHigh: {highValueY.value} [bold]  [/]\nClose: {valueY.value} [bold]  [/]`;
		
			series.dropFromOpenState.properties.fill = am4core.color("#ed193f");
			series.dropFromOpenState.properties.stroke = am4core.color("#ed193f");
		
			series.riseFromOpenState.properties.fill = am4core.color("#2db43a");
			series.riseFromOpenState.properties.stroke = am4core.color("#2db43a");
		
			chart.cursor = new am4charts.XYCursor();
			chart.scrollbarX = new am4core.Scrollbar();
			chart.data = newData
	})
}

function filterByDate(dataToSort){


		const notSortedData = 
			[
				{
				  "open": 8.426607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 1,
				  "dateInterval": {
					"start": "2019-07-25T08:01:31 -06:00",
					"end": "2019-07-25T01:03:57 -06:00"
				  }
				},
				{
				  "open": 8.226607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 4,
				  "dateInterval": {
					"start": "2019-07-26T08:01:35 -06:00",
					"end": "2019-07-26T01:03:47 -06:00"
				  }
				},
				{
				  "open": 8.126607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 3,
				  "dateInterval": {
					"start": "2019-07-27T08:01:33 -06:00",
					"end": "2019-07-27T01:03:57 -06:00"
				  }
				},
				{
				  "open": 8.326607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 2,
				  "dateInterval": {
					"start": "2019-07-28T08:01:32 -06:00",
					"end": "2019-07-28T01:03:17 -06:00"
				  }
				},
				{
				  "open": 8.426607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 1,
				  "dateInterval": {
					"start": "2019-07-29T08:01:31 -06:00",
					"end": "2019-07-29T01:03:57 -06:00"
				  }
				},
				{
				  "open": 8.226607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 4,
				  "dateInterval": {
					"start": "2019-07-30T08:01:35 -06:00",
					"end": "2019-07-30T01:03:47 -06:00"
				  }
				},
				{
				  "open": 8.126607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 3,
				  "dateInterval": {
					"start": "2019-07-31T08:01:33 -06:00",
					"end": "2019-07-31T01:03:57 -06:00"
				  }
				},
				{
				  "open": 8.326607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 2,
				  "dateInterval": {
					"start": "2019-08-01T08:01:32 -06:00",
					"end": "2019-08-01T01:03:17 -06:00"
				  }
				},
				{
				  "open": 22.326607,
				  "close": 21.042771,
				  "high": 25.25821,
				  "low": 1.49765,
				  "numberOfTrades": 2,
				  "dateInterval": {
					"start": "2019-08-02T08:01:32 -06:00",
					"end": "2019-08-02T01:03:17 -06:00"
				  }
				},
				{
				  "open": 8.326607,
				  "close": 6.042771,
				  "high": 3.25821,
				  "low": 8.49765,
				  "numberOfTrades": 2,
				  "dateInterval": {
					"start": "2019-08-03T08:01:32 -06:00",
					"end": "2019-08-03T01:03:17 -06:00"
				  }
				},
			];
	
		
			
			let data = notSortedData
			// let data = dataToSort
			let dataCopy = JSON.parse(JSON.stringify(data));
			
			let dataCopySorted = dataCopy.sort((a, b)=>{
				let startTimeA = new Date(a['dateInterval']['start'].replace(/\s+/g,''));
				let startTimeB = new Date(b['dateInterval']['start'].replace(/\s+/g,''));
				return startTimeA.getTime() - startTimeB.getTime();
			})



			
			let newSortedData = dataCopySorted.map((item) => {

				let itemCopy = JSON.parse(JSON.stringify(item));

				itemCopy.dateInterval = itemCopy.dateInterval.start

				return itemCopy;
			})
			return newSortedData
}



			
			// let getDataFormated = (dateType) =>{
			// let dataCopySortedDate;
			// 	switch (dateType) {
			// 		case 'hours':
			// 			dataCopySortedDate = dataCopySorted.map((item)=>{
			// 				let itemCopy = JSON.parse(JSON.stringify(item));
			// 				let start = new Date(itemCopy.dateInterval.start.replace(/\s+/g,''));
			// 				let end = new Date(itemCopy.dateInterval.end.replace(/\s+/g,''));

			// 				itemCopy.dateInterval.start = start.getHours() + ' (' + (getWeekDay[start.getDay()]) + ')'
			// 				itemCopy.dateInterval.end = end.getHours() + ' (' + (getWeekDay[end.getDay()]) + ')'
			// 				return itemCopy;
			// 			});
			// 			break;
			// 		case 'month':
			// 			dataCopySortedDate = dataCopySorted.map((item)=>{
			// 				let itemCopy = JSON.parse(JSON.stringify(item));
			// 				itemCopy.dateInterval.start = (new Date(itemCopy.dateInterval.start.replace(/\s+/g,''))).getMonth() + 1
			// 				itemCopy.dateInterval.end = (new Date(itemCopy.dateInterval.end.replace(/\s+/g,''))).getMonth() + 1
			// 				return itemCopy;
			// 			});
			// 			break;
			// 		default:
			// 			dataCopySortedDate = dataCopySorted.map((item)=>{
			// 				let itemCopy = JSON.parse(JSON.stringify(item));
			// 				itemCopy.dateInterval.start = new Date(itemCopy['dateInterval']['start'].replace(/\s+/g,''))
			// 				itemCopy.dateInterval.end = new Date(itemCopy['dateInterval']['end'].replace(/\s+/g,''))
			// 				return itemCopy;
			// 			});
			// 			break;
			// 	}
			// 	return dataCopySortedDate;
			// }
	
			// let a = getDataFormated('default')







	
			
	
	
	
		// 	let dataJson = JSON.parse(JSON.stringify(data))
		// 	// console.log(dataJson)
		
		// 	let dataOpen = (data.map(item => item.open))
			
		// 	// console.log(dataOpen)
		// // 	// console.log(typeof dataOpen)
			
		// 	let dataClose = (data.map(item => item.close))
		// 	let dataHigh = (data.map(item => item.high))
		// 	let dataLow = (data.map(item => item.low))
		// 	let dataTrades = (data.map(item => item.numberOfTrades))
		// 	let dataStart = data.map(item => item.dateInterval.start)
		// 	let dataEnd = data.map(item => item.dateInterval.end)
			
		// 	let dataStartNew = []


		// 	dataStart.forEach(data => {
		// 		let d =	`"${data}"`
		// 		let now = new Date(data.replace(/\s+/g,''));
		// 		let date = now.getMonth()
		// 		// console.log(now.getTime());
		// 	})
	
			
			
	
	






























	// let responseDataTest = [
	// 	{
	// 	  "open": 2.804633,
	// 	  "close": 2.581577,
	// 	  "high": 2.779929,
	// 	  "low": 2.936543,
	// 	  "numberOfTrades": 15,
	// 	  "date": "2019-01-01T04:32:04 -06:00"
	// 	},
	// 	{
	// 	  "open": 4.044035,
	// 	  "close": 4.972104,
	// 	  "high": 2.64346,
	// 	  "low": 2.280801,
	// 	  "numberOfTrades": 31,
	// 	  "date": "2019-01-02T08:29:50 -06:00"
	// 	},
	// 	{
	// 	  "open": 2.694042,
	// 	  "close": 2.186107,
	// 	  "high": 3.302184,
	// 	  "low": 3.853225,
	// 	  "numberOfTrades": 6,
	// 	  "date": "2019-01-03T12:34:40 -06:00"
	// 	},
	// 	{
	// 	  "open": 2.994971,
	// 	  "close": 3.144407,
	// 	  "high": 3.821939,
	// 	  "low": 3.163509,
	// 	  "numberOfTrades": 32,
	// 	  "date": "2019-01-04T02:49:16 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.409394,
	// 	  "close": 3.445626,
	// 	  "high": 3.707244,
	// 	  "low": 3.723903,
	// 	  "numberOfTrades": 6,
	// 	  "date": "2019-01-05T08:35:02 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.915916,
	// 	  "close": 3.56014,
	// 	  "high": 3.517642,
	// 	  "low": 2.513464,
	// 	  "numberOfTrades": 10,
	// 	  "date": "2019-01-06T01:52:51 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.857038,
	// 	  "close": 3.930472,
	// 	  "high": 3.025891,
	// 	  "low": 3.946035,
	// 	  "numberOfTrades": 9,
	// 	  "date": "2019-01-07T12:02:41 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.875092,
	// 	  "close": 3.721939,
	// 	  "high": 3.394264,
	// 	  "low": 3.210508,
	// 	  "numberOfTrades": 12,
	// 	  "date": "2019-01-08T04:25:49 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.957282,
	// 	  "close": 3.653788,
	// 	  "high": 3.498441,
	// 	  "low": 3.578542,
	// 	  "numberOfTrades": 12,
	// 	  "date": "2019-01-09T05:39:18 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.391684,
	// 	  "close": 3.219497,
	// 	  "high": 3.994729,
	// 	  "low": 3.529791,
	// 	  "numberOfTrades": 27,
	// 	  "date": "2019-01-10T01:56:48 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.342724,
	// 	  "close": 3.586807,
	// 	  "high": 3.384919,
	// 	  "low": 3.062565,
	// 	  "numberOfTrades": 1,
	// 	  "date": "2019-01-11T04:00:34 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.520729,
	// 	  "close": 3.181541,
	// 	  "high": 3.835894,
	// 	  "low": 3.662834,
	// 	  "numberOfTrades": 20,
	// 	  "date": "2019-01-12T10:18:59 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.828005,
	// 	  "close": 3.512054,
	// 	  "high": 3.467107,
	// 	  "low": 3.334542,
	// 	  "numberOfTrades": 28,
	// 	  "date": "2019-01-13T09:29:54 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.493867,
	// 	  "close": 3.156127,
	// 	  "high": 3.563064,
	// 	  "low": 3.421415,
	// 	  "numberOfTrades": 21,
	// 	  "date": "2019-01-14T10:12:43 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.501016,
	// 	  "close": 3.181963,
	// 	  "high": 3.952292,
	// 	  "low": 3.90594,
	// 	  "numberOfTrades": 16,
	// 	  "date": "2019-01-15T11:20:51 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.52288,
	// 	  "close": 3.874161,
	// 	  "high": 3.025111,
	// 	  "low": 3.114671,
	// 	  "numberOfTrades": 19,
	// 	  "date": "2019-01-16T08:09:39 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.418653,
	// 	  "close": 3.829744,
	// 	  "high": 3.583863,
	// 	  "low": 3.100384,
	// 	  "numberOfTrades": 31,
	// 	  "date": "2019-01-17T12:53:01 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.163529,
	// 	  "close": 3.643761,
	// 	  "high": 3.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-18T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.163529,
	// 	  "close": 3.643761,
	// 	  "high": 3.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-19T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.163529,
	// 	  "close": 3.643761,
	// 	  "high": 3.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-20T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.463529,
	// 	  "close": 3.643761,
	// 	  "high": 3.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-21T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.563529,
	// 	  "close": 3.343761,
	// 	  "high": 3.439495,
	// 	  "low": 3.196538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-22T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.563529,
	// 	  "close": 3.343761,
	// 	  "high": 3.439495,
	// 	  "low": 2.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-23T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.063529,
	// 	  "close": 3.643761,
	// 	  "high": 3.439495,
	// 	  "low": 3.196538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-24T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.163529,
	// 	  "close": 3.643761,
	// 	  "high": 4.439495,
	// 	  "low": 2.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-25T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.863529,
	// 	  "close": 3.643761,
	// 	  "high": 4.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-26T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.663529,
	// 	  "close": 3.643761,
	// 	  "high": 4.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-27T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.263529,
	// 	  "close": 3.643761,
	// 	  "high": 4.239495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-28T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.363529,
	// 	  "close": 3.643761,
	// 	  "high": 4.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-29T09:27:33 -06:00"
	// 	},
	// 	{
	// 	  "open": 3.563529,
	// 	  "close": 3.643761,
	// 	  "high": 4.439495,
	// 	  "low": 3.596538,
	// 	  "numberOfTrades": 17,
	// 	  "date": "2019-01-30T09:27:33 -06:00"
	// 	},
	//   ];
	

function inputsSettings(){
	const inputsTypeNumber = document.body.querySelectorAll('input[type="text"]')
	inputsTypeNumber.forEach((input) => {
		//делаем вид что инпуты заполнены
		var numberMask = IMask(
			document.getElementById('number-mask'),
			{
			  mask: Number,
			  min: 0,
			  max: 1000000000000000000000000,
			  scale: 8,
			  thousandsSeparator: '',
			  padFractionalZeros: true
			});

		input.addEventListener('blur', function(e){
			// this.value = this.value.replace(/[^\d.]+|(\.\d{8})\d*$/g, '$1')
			// let inputValue = numeral(e.target.value).format('0.00000000');
			e.target.value = e.target.value.replace(/[^\d.]+|(\.\d{8})\d*$/g, '$1')
		})
		// input.addEventListener('input', function(e){
			
		// 	this.value = this.value.replace(/[^\d.]+|(\.\d{8})\d*$/g, '$1')
		// 	const code = e.keyCode
		// 	if(code === 38 || code === 40){
		// 		e.preventDefault()
		// 		input.focus();
		// 	}
		// })
		
	})
}