/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function Source(_x,_y){
	this.id = 0;

	this.x = _x;
	this.y = _y;

	this.upload = [ new Array(),new Array(),new Array(),new Array(),new Array(),new Array() ];

	this.currentUpload = [0,0,0,0,0,0];

	this.packetCount = 0;
	this.packet = undefined;

	this.size = 25;

	this.frame = 0;

	this.loopCount = 0;
	this.maxLoopInterval = 200;
	this.minLoopInterval = 1;
	this.loopInterval = this.maxLoopInterval;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.updatePacket = function(){
	if(!this.packet && this.loopCount===0){
		this.generatePacket();
	}
	else if(this.packet){
		//make sure that the target upload connection still exists!!!!
		var modula;
		if(this.upload[this.packet.club].length>0) modula = this.upload[this.packet.club].length;
		else modula = 1;
		this.currentUpload[this.packet.club] = this.currentUpload[this.packet.club] % modula;

		//step through the current packet's club's upload array and send the packet
		var targetClub = this.packet.club;
		var uploadIndex = this.currentUpload[targetClub];
		if(this.upload[targetClub].length>0){
			var targetPeer = this.upload[targetClub][uploadIndex].id;
			if(clubs[targetClub] && clubs[targetClub].peers[targetPeer]){

				//clubs[targetClub].peers[targetPeer].addPacket(this.packet); // SEND THE PACKET
				var tempCapsule = new Capsule(targetClub,targetClub,0,targetPeer,this.packet,'source');
				capsules.push(tempCapsule);
			}
		}

		//increment the stepper, and if we've come full circle (or if there's nothing...), make a new packet
		var modula;
		if(this.upload[this.packet.club].length>0) modula = this.upload[this.packet.club].length;
		else modula = 1;
		this.currentUpload[this.packet.club] = (this.currentUpload[this.packet.club]+1) % modula;
		if(this.currentUpload[this.packet.club]===0){
			this.packet = undefined;
			this.loopCount = (this.loopCount+1)%this.loopInterval;
		}
	}
	else{
		this.loopCount = (this.loopCount+1)%this.loopInterval;
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.generatePacket = function(){
	if(clubs.length>0){
		var tempId = this.packetCount;
		var tempClub = this.packetCount%clubs.length;

		var value = this.packetCount;
		this.packet = new Packet(tempId,tempClub,value);
		this.packetCount++;
		this.frame = this.packet.value;
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.paint_body = function(){

	var theFrame = frames[this.frame%frames.length];

	var xPos = this.x-theFrame.width/2;
	var yPos = this.y-theFrame.height/2;
	var w = theFrame.width;
	var h = theFrame.height;
	
	context.globalAlpha = 1;
	context.drawImage(theFrame,xPos,yPos,w,h);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.paint_connections = function(){
	for(var i=0;i<this.upload.length;i++){
		for(var c=0;c<this.upload[i].length;c++){
			var x = clubs[this.upload[i][c].club].peers[this.upload[i][c].id].x;
			var y = clubs[this.upload[i][c].club].peers[this.upload[i][c].id].y;

			context.strokeStyle = 'blue';
			context.lineWidth = 6;
			context.globalAlpha = .1;

			context.beginPath();
			context.moveTo(x,y);
			context.lineTo(this.x,this.y);
			context.stroke();
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.checkConnections = function(){

	for(var n=0;n<this.upload.length;n++){
		for(var m=0;m<this.upload[n].length;m++){
			var tempClub = this.upload[n][m].club;
			var tempId = this.upload[n][m].id;
			if(!clubs[tempClub] || !clubs[tempClub].peers[tempId]){
				this.upload[n].splice(m,1);
				m--;
			}
		}
	}

	//test for in club uploads
	for(var i=0;i<clubs.length;i++){
		if(this.upload[i].length>3){
			this.removeUpload(i);
		}
		else if(this.upload[i].length<2 && clubs[i].peers.length>2){
			this.addUpload(i);
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.removeUpload = function(c,peerID){
	if(peerID===undefined){
		peerID = this.upload[c][0].id;
		clubs[c].peers[peerID].removeDownload(c,0);
		this.upload[c].splice(0,1);
	}
	else{
		for(var i=0;i<this.upload[c].length;i++){
			if(this.upload[c][i].id===peerID){
				this.upload[c].splice(i,1);
				break;
			}
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Source.prototype.addUpload = function(c,peerID){

	if(peerID===undefined){
		peerID = Math.floor(Math.random()*clubs[c].peers.length);
		while(clubs[c].peers[peerID]===undefined || clubs[c].peers[peerID]===this){ //can't be the source (index 0)
			peerID = Math.floor(Math.random()*clubs[c].peers.length);
		}
		clubs[c].peers[peerID].addDownload(c,0);
	}

	//make the connection object
	var tempConnection = {
		'club':c,
		'id':peerID
	};

	//then append it
	this.upload[c].push(tempConnection);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////