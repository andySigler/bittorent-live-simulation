/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function Packet(_id,_club,_value){
	this.id = _id;
	this.club = _club;
	this.value = _value;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function Capsule(startClub,endClub,startID,endID,packet,type){
	this.startClub = startClub;
	this.endClub = endClub;
	this.startID = startID;
	this.endID = endID;

	this.packet = packet;

	this.type = type;

	this.x = clubs[startClub].peers[startID].x;
	this.y = clubs[startClub].peers[startID].y;

	var xDiff = clubs[this.endClub].peers[this.endID].x-clubs[startClub].peers[startID].x;
	var yDiff = clubs[this.endClub].peers[this.endID].y-clubs[startClub].peers[startID].y;
	var totalDiff = Math.sqrt(Math.pow(xDiff,2)+Math.pow(yDiff,2));

	var speed = (1-slider.one)*5+15;
	if(this.type==='outClub') speed*=0.75;

	this.stepAmount = Math.ceil(totalDiff/speed);
	this.stepCount = 0;

	this.done = false;

	this.fillAmount = slider.one*.6+.4;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Capsule.prototype.transferPacket = function(){
	if(clubs[this.endClub] && clubs[this.endClub].peers[this.endID]){
		clubs[this.endClub].peers[this.endID].addPacket(this.packet);
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Capsule.prototype.update = function(){
	if(clubs[this.endClub] && clubs[this.endClub].peers[this.endID] && clubs[this.startClub] && clubs[this.startClub].peers[this.startID]){
		var xStep = (clubs[this.endClub].peers[this.endID].x - this.x) / (this.stepAmount-this.stepCount);
		var yStep = (clubs[this.endClub].peers[this.endID].y - this.y) / (this.stepAmount-this.stepCount);

		this.x+=xStep;
		this.y+=yStep;

		this.stepCount++;
		if(this.stepCount===this.stepAmount){
			this.done = true;
			this.transferPacket();
		}
	}
	else{
		this.done = true;
		this.transferPacket();
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Capsule.prototype.paint = function(){
	if(this.type==='source'){
		var tempSize = 5;
		var tempFill = 1*this.fillAmount;
		context.fillStyle = '#ff0000';
	}
	else if(this.type==='inClub'){
		var tempSize = 5;
		var tempFill = .8*this.fillAmount;
		context.fillStyle = '#ff0000';
	}
	else if(this.type==='outClub'){
		var tempSize = 3;
		var tempFill = .6*this.fillAmount;
		context.fillStyle = '#000000';
	}
	if(source.autoPilot) tempFill = .5;
	context.globalAlpha = tempFill;
	context.beginPath();
	context.arc(this.x,this.y,tempSize,0,Math.PI*2,false);
	context.fill();
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////