var gitGraph = function (canvas, graphList, config) {
	if (!canvas.getContext) {
		return;
	};
	
	if (typeof config === "undefined") {
		config = {
			unitSize: 19,
			lineWidth: 3,
			nodeRadius: 4
		}
	};
	
	var flows = [];
	
	canvas.height = graphList.length * config.unitSize;
	
	var ctx = canvas.getContext("2d");
	
	ctx.lineWidth = config.lineWidth;
	ctx.lineJoin = "round";
	ctx.lineCap = "round";
	
	var genRandomStr = function () {
		var chars = "0123456789ABCDEF";
		var stringLength = 6;
		var randomString = '';
		var rnum;
		for (var i = 0; i< stringLength; i++) {
			rnum = Math.floor(Math.random() * chars.length);
			randomString += chars.substring(rnum, rnum + 1);
		}
		
		return randomString;
	}
	
	var genNewFlow = function () {
		var newId;
		
		do {
			newId = genRandomStr();
		} while (findFlow(newId) != -1);
		
		return {id:newId, color:"#" + newId};
	}
	
	var findFlow = function (id) {
		var i = flows.length;
		
		while (i-- && flows[i].id != id);
		
		return i;
	}
	
	var findColomn = function (symbol, row) {
		var i = row.length;
		
		while (i-- && row[i] != symbol);
		
		return i;
	}
	
	//draw method
	var drawLineRight = function (x, y, color) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y + config.unitSize / 2);
		ctx.lineTo(x + config.unitSize, y + config.unitSize / 2);
		ctx.stroke();
	}
	
	var drawLineUp = function (x, y, color) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y + config.unitSize / 2);
		ctx.lineTo(x, y - config.unitSize / 2);
		ctx.stroke();
	}
	
	var drawNode = function (x, y, color) {
		ctx.strokeStyle = color;
		
		drawLineUp(x, y, color);
		
		ctx.beginPath();
		ctx.arc(x, y, config.nodeRadius, 0, Math.PI * 2, true);
		ctx.fill();
	}
	
	var drawLineIn = function (x, y, color) {
		ctx.strokeStyle = color;
		
		ctx.beginPath();
		ctx.moveTo(x + config.unitSize, y + config.unitSize / 2);
		ctx.lineTo(x, y - config.unitSize / 2);
		ctx.stroke();
	}
	
	var drawLineOut = function (x, y, color) {
		ctx.strokeStyle = color;
		ctx.beginPath();
		ctx.moveTo(x, y + config.unitSize / 2);
		ctx.lineTo(x + config.unitSize, y - config.unitSize / 2);
		ctx.stroke();
	}
	
	//main method
	var draw = function (graphList) {
		var colomn, colomnIndex, prevColomn;
		var x, y;
		var color, colomnIndex;
		var nodePos, outPos;
		var tempFlow;
		var prevRowLength = 0;
		var l = graphList.length;
		var flowSwapPos = -1;
		var lastLinePos;
		var lastConnectPos;
		
		var inlineIntersect = false;
		
		flows.push(genNewFlow()) //first flow
		
		y = canvas.height - 0.5 * config.unitSize;
		
		for (var i = 0; i < l; i++) {
			x = config.unitSize * 0.5;
			
			currentRow = graphList[i];
			nextRow = graphList[i + 1];
			prevRow = graphList[i - 1];
			
			flowSwapPos = -1;
			
			//pre process begin
			//use last row for analysing
			if (prevRow) {
				
				if (!inlineIntersect) {
					//intersect might happen
					for (colomnIndex = 0; colomnIndex < prevRow.length; colomnIndex++) {
						if (prevRow[colomnIndex + 1] && 
							(prevRow[colomnIndex] == "/" && prevRow[colomnIndex + 1] == "|") || 
							((prevRow[colomnIndex] == "_" && prevRow[colomnIndex + 1] == "|") &&
							(prevRow[colomnIndex + 2] == "/"))) {
							
							flowSwapPos = colomnIndex;
							
							//swap two flows
							tempFlow = {id:flows[flowSwapPos].id, color:flows[flowSwapPos].color};
							
							flows[flowSwapPos].id = flows[flowSwapPos + 1].id;
							flows[flowSwapPos].color = flows[flowSwapPos + 1].color;
							
							flows[flowSwapPos + 1].id = tempFlow.id;
							flows[flowSwapPos + 1].color = tempFlow.color;
						};
					};
				};
				
				if (prevRowLength < currentRow.length &&
					(nodePos = findColomn("*", currentRow) != -1) &&
					(nodePos = findColomn("_", currentRow) == -1)) {
					
					if ((outPos = findColomn("/", prevRow)) == -1 || 
						(outPos != -1 && prevRow[outPos - 1] && prevRow[outPos - 1] != "|")) {
						
						flows.splice(nodePos, 0, genNewFlow());
					};
				};
				
				if (prevRowLength > currentRow.length &&
					(nodePos = findColomn("*", prevRow) != -1)) {
					
					if (findColomn("_", currentRow) == -1 &&
						findColomn("/", currentRow) == -1 && 
						findColomn("\\", currentRow) == -1) {
						
						flows.splice(nodePos + 1, 1);
					};
				};
			};
			
			prevRowLength = currentRow.length; //store for next round
			colomnIndex = 0; //reset index
			var condenseIndex = 0;
			while (colomnIndex < currentRow.length) {
				colomn = currentRow[colomnIndex];
				
				if (colomn != " ") {
					++condenseIndex;
				};
				
				//create new flow only when no intersetc happened
				if (flowSwapPos == -1 &&
					currentRow[colomnIndex + 1] && 
					currentRow[colomnIndex + 1] == "/" && 
					colomn == "|") { 
					
					
					flows.splice(colomnIndex, 0, genNewFlow());
				};
				
				//change \ to | when it's in the last position of the whole row
				if ((colomnIndex == currentRow.length - 1) &&
					(colomn == "/" || colomn == "\\") &&
					((lastLinePos = findColomn("|", currentRow)) != -1 ||
					(lastLinePos = findColomn("*", currentRow)) != -1) &&
					(lastLinePos < colomnIndex - 1)) {
					
					while (++lastLinePos && currentRow[lastLinePos] == " ") {}
					
					if (lastLinePos == colomnIndex) {
						currentRow[colomnIndex] = "|";
					};
				};
				
				if (colomn == "*" &&
					prevRow && 
					prevRow[condenseIndex + 1] == "\\") {
					flows.splice(condenseIndex, 1);
					
				};
				
				++colomnIndex;
			}
			
			colomnIndex = 0;
			
			condenseIndex = 0;
			
			for (var k = 0; k < currentRow.length; k++) {
				if (currentRow[k] != " " && currentRow[k] != "_") {
					condenseIndex++;
				};
			};
			
			if (flows.length > condenseIndex) {
				flows.splice(condenseIndex, flows.length - condenseIndex);
			};
			
			//draw
			while (colomnIndex < currentRow.length) {
				colomn = currentRow[colomnIndex];
				prevColomn = currentRow[colomnIndex - 1];
				
				if (currentRow[colomnIndex] == " ") {
					currentRow.splice(colomnIndex, 1);
					x += config.unitSize;
					
					continue;
				};
				
				//inline interset
				if ((colomn == "_" || colomn == "/") &&
					currentRow[colomnIndex - 1] == "|" &&
					currentRow[colomnIndex - 2] == "_") {
					
					inlineIntersect = true;
					
					tempFlow = flows.splice(colomnIndex - 2, 1)[0];
					flows.splice(colomnIndex - 1, 0, tempFlow);
					currentRow.splice(colomnIndex - 2, 1);
					
					colomnIndex = colomnIndex - 1;
				} else {
					inlineIntersect = false
				}
				
				colorIndex = colomnIndex;
				
				color = flows[colorIndex].color;
				
				switch (colomn) {
					case "_" :
						drawLineRight(x, y, color);
						
						x += config.unitSize;
						break;
						
					case "*" :
						drawNode(x, y, color);
						break;
						
					case "|" :
						drawLineUp(x, y, color);
						break;
						
					case "/" :
						if (prevColomn && 
							(prevColomn == "/" || 
							prevColomn == " ")) {
							x -= config.unitSize;
						};
						
						drawLineOut(x, y, color);
						
						x += config.unitSize;
						break;
						
					case "\\" :
						drawLineIn(x, y, color);
						break;
				}
				
				++colomnIndex;
			}
			
			y -= config.unitSize;
		}
	}
	
	draw(graphList);
};