/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

function Peer(_id,_club,_startFrame){
	this.id = _id;
	this.club = _club;

	this.x;
	this.y;

	this.download = [];
	this.playback = [];
	this.broadcast = [];

	this.playbackIndex = -1;
	this.playing = false;

	this.inClub_upload = [];
	this.inClub_download = [];
	this.outClub_upload = [];
	this.outClub_download = [undefined,undefined,undefined,undefined,undefined,undefined];

	this.inClub_tenCount = 0;
	this.inClub_currentUploader = 0;
	this.outClub_currentUploader = 0;

	this.scale = .33;

	this.frame = _startFrame;

	this.cutChance = 0.05;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.animate = function(slide){
	if(this.playbackIndex<this.playback.length-1){
		this.playbackIndex++;
	}

	var tempFrame = this.frame;
	if(this.playback[this.playbackIndex]){
		tempFrame = this.playback[this.playbackIndex].value;
	}

	// y (n) = y (n-1) + ((x (n) - y (n-1))/slide)
	if(tempFrame>=this.frame){
		this.frame = Math.floor(this.frame + ((tempFrame-this.frame)/slide));
	}

	var theFrame = frames[(this.frame)%frames.length];

	var xPos = this.x-(theFrame.width*this.scale)/2;
	var yPos = this.y-(theFrame.height*this.scale)/2;
	var w = theFrame.width*this.scale;
	var h = theFrame.height*this.scale;

	context.globalAlpha = 1;
	context.drawImage(theFrame,xPos,yPos,w,h);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.updatePacket = function(){
	//check for the oldest packet in our download queue
	if(this.download.length>0){
		if(this.download[0]){
			var tempPacket = this.download[0];
			this.download.splice(0,1);
			if(!this.playback[tempPacket.id]){
				this.playback[tempPacket.id] = tempPacket;
				this.playbackIndex = this.playback.length-12; // THIS KEEPS PLAYBACK FROM STUTTERING !!!!
				if(tempPacket.club===this.club){
					this.broadcast.push(tempPacket);
				}
			}
		}
		else{
			this.download.splice(0,1);
		}
	}
	//check if there's something to send in club
	var inSent = false;
	if(this.inClub_upload.length>0 && this.inClub_tenCount<10){
		if(!this.inClub_upload[this.inClub_currentUploader]){
			this.inClub_currentUploader = this.inClub_currentUploader%this.inClub_upload.length; //round it out
		}

		//find an upload connection that can actually use a packet from this peer
		for(var i=0;i<this.inClub_upload.length;i++){

			var tempUploadIndex = (i+this.inClub_currentUploader)%this.inClub_upload.length;	

			if(this.inClub_upload[tempUploadIndex].index<this.broadcast.length){

				var tempClub = this.inClub_upload[this.inClub_currentUploader].club;
				var tempId = this.inClub_upload[this.inClub_currentUploader].id;
				var tempIndex = this.inClub_upload[this.inClub_currentUploader].index;

				var tempCapsule = new Capsule(this.club,tempClub,this.id,tempId,this.broadcast[tempIndex],'inClub');
				capsules.push(tempCapsule);

				this.inClub_currentUploader++; //increment 
				this.inClub_upload[tempUploadIndex].index++;
				inSent = true;
				this.inClub_tenCount++;
				break;
			}
		}
	}

	if(!inSent && this.outClub_upload.length>0){

		if(!this.outClub_upload[this.outClub_currentUploader]){
			this.outClub_currentUploader = this.outClub_currentUploader%this.outClub_upload.length; //round it out
		}

		//find an upload connection that can actually use a packet from this peer
		for(var i=0;i<this.outClub_upload.length;i++){

			var tempUploadIndex = (i+this.outClub_currentUploader)%this.outClub_upload.length;	

			if(this.outClub_upload[tempUploadIndex].index<this.broadcast.length){

				var tempClub = this.outClub_upload[this.outClub_currentUploader].club;
				var tempId = this.outClub_upload[this.outClub_currentUploader].id;
				var tempIndex = this.outClub_upload[this.outClub_currentUploader].index;

				var tempCapsule = new Capsule(this.club,tempClub,this.id,tempId,this.broadcast[tempIndex],'outClub');
				capsules.push(tempCapsule);

				this.outClub_currentUploader++; //increment 
				this.outClub_upload[tempUploadIndex].index++;
				this.inClub_tenCount=0;
				break;
			}
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.addPacket = function(thePacket){
	this.download.push(thePacket);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.paint_connections = function(){

	var i;
	for(i=0;i<this.inClub_upload.length;i++){

		context.globalAlpha = 1;

		var bx = this.x;
		var by = this.y;

		var ox = clubs[this.inClub_upload[i].club].peers[this.inClub_upload[i].id].x;
		var oy = clubs[this.inClub_upload[i].club].peers[this.inClub_upload[i].id].y;

		context.globalAlpha = .5;
		context.lineWidth = 7;

		context.strokeStyle = 'orange';

		context.beginPath();
		context.moveTo(bx,by);
		context.lineTo(ox,oy);
		context.stroke();
	}
	for(i=0;i<this.inClub_download.length;i++){

		context.globalAlpha = 1;

		var bx = this.x;
		var by = this.y;

		var ox = clubs[this.inClub_download[i].club].peers[this.inClub_download[i].id].x;
		var oy = clubs[this.inClub_download[i].club].peers[this.inClub_download[i].id].y;

		context.globalAlpha = .5;
		context.lineWidth = 7;

		context.strokeStyle = 'green';

		context.beginPath();
		context.moveTo(bx,by);
		context.lineTo(ox,oy);
		context.stroke();
	}
	for(i=0;i<this.outClub_upload.length;i++){

		if(this.outClub_upload[i]!==undefined){

			var bx = this.x;
			var by = this.y;

			var ox = clubs[this.outClub_upload[i].club].peers[this.outClub_upload[i].id].x;
			var oy = clubs[this.outClub_upload[i].club].peers[this.outClub_upload[i].id].y;

			context.globalAlpha = 1;
			context.lineWidth = 1;

			context.strokeStyle = 'orange';

			context.beginPath();
			context.moveTo(bx,by);
			context.lineTo(ox,oy);
			context.stroke();
		}
	}
	for(i=0;i<this.outClub_download.length;i++){

		if(this.outClub_download[i]!==undefined){

			var bx = this.x;
			var by = this.y;

			var ox = clubs[this.outClub_download[i].club].peers[this.outClub_download[i].id].x;
			var oy = clubs[this.outClub_download[i].club].peers[this.outClub_download[i].id].y;

			context.globalAlpha = 1;
			context.lineWidth = 1;

			context.strokeStyle = 'green';

			context.beginPath();
			context.moveTo(bx,by);
			context.lineTo(ox,oy);
			context.stroke();
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.checkConnections = function(){

	var n;
	for(n=0;n<this.inClub_upload.length;n++){
		var tempClub = this.inClub_upload[n].club;
		var tempId = this.inClub_upload[n].id;
		if(!clubs[tempClub] || !clubs[tempClub].peers[tempId]){
			this.inClub_upload.splice(n,1);
			n--;
		}
	}
	for(n=0;n<this.inClub_download.length;n++){
		var tempClub = this.inClub_download[n].club;
		var tempId = this.inClub_download[n].id;
		if(!clubs[tempClub] || !clubs[tempClub].peers[tempId]){
			this.inClub_download.splice(n,1);
			n--;
		}
	}
	for(n=0;n<this.outClub_download.length;n++){
		if(this.outClub_download[n]){
			var tempClub = this.outClub_download[n].club;
			var tempId = this.outClub_download[n].id;
			if(!clubs[tempClub] || !clubs[tempClub].peers[tempId]){
				this.outClub_download[n] = undefined;
			}
		}
	}
	for(n=0;n<this.outClub_upload.length;n++){
		var tempClub = this.outClub_upload[n].club;
		var tempId = this.outClub_upload[n].id;
		if(!clubs[tempClub] || !clubs[tempClub].peers[tempId]){
			this.outClub_upload.splice(n,1);
			n--;
		}
	}

	if(Math.random()<this.cutChance*2){
		//test to in club uploads
		if(this.inClub_upload.length>3){
			this.removeUpload(this.club);
		}
		else if(this.inClub_upload.length<2 && clubs[this.club].peers.length>2){
			this.addUpload(this.club);
		}
		else if(this.inClub_upload.length>0 && Math.random()<this.cutChance){
			this.removeUpload(this.club);
		}

		//test the in club downloads
		if(this.inClub_download.length>3){
			this.removeDownload(this.club);
		}
		else if(this.inClub_download.length<2){
			this.addDownload(this.club);
		}
	}
	var i = Math.floor(Math.random()*(clubs.length-1));
	for(var n=0;n<clubs.length-1;n++){
		var i=n;
		if(i===this.club) i=clubs.length-1;
		if(this.outClub_download[i]===undefined && clubs[i].peers.length>1){
			this.addDownload(i);
		}
	}
	if(Math.random()<this.cutChance*.1 && this.outClub_upload.length>0){
		var cutClub = this.outClub_upload[0].club;
		this.removeUpload(cutClub);
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.removeUpload = function(c,peerID){
	if(peerID===undefined){
		var removedID;
		if(c===this.club) removedID = this.inClub_upload[0].id;
		else removedID = this.outClub_upload[0].id;
		clubs[c].peers[removedID].removeDownload(this.club,this.id); //initiate if no id is specified
		if(c===this.club) this.inClub_upload.splice(0,1);
		else this.outClub_upload.splice(0,1);
	}
	else if(c===this.club){
		for(var i=0;i<this.inClub_upload.length;i++){
			if(this.inClub_upload[i].id===peerID){
				this.inClub_upload.splice(i,1);
				break;
			}
		}
	}
	else{
		for(var i=0;i<this.outClub_upload.length;i++){
			if(this.outClub_upload[i].id===peerID){
				this.outClub_upload.splice(i,1);
				break;
			}
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.addUpload = function(c,peerID){

	if(peerID===undefined){
		peerID = Math.floor(Math.random()*clubs[c].peers.length-1);
		while(clubs[c].peers[peerID]===undefined || clubs[c].peers[peerID]===this || peerID===0 ){ //can't be the source (index 0)
			peerID = Math.floor(Math.random()*clubs[c].peers.length);
		}
		clubs[c].peers[peerID].addDownload(this.club,this.id); //initiate if no id is specified
	}

	//make the connection object
	var tempConnection = {
		'club':c,
		'id':peerID,
		'index': this.broadcast.length
	};

	//then append it
	if(c===this.club) this.inClub_upload.push(tempConnection);
	else this.outClub_upload.push(tempConnection);
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.removeDownload = function(c,peerID){
	if(peerID===undefined){
		var removedID = this.inClub_download[0].id;
		clubs[c].peers[removedID].removeUpload(this.club,this.id); //initiate if no id is specified
		if(c===this.club) this.inClub_download.splice(0,1);
		else this.outClub_download.splice(0,1);
	}
	else if(c===this.club){
		for(var i=0;i<this.inClub_download.length;i++){
			if(this.inClub_download[i].id===peerID){
				this.inClub_download.splice(i,1);
				break;
			}
		}
	}
	else{
		if(this.outClub_download[c].id===peerID){
			this.outClub_download[c] = undefined;
			this.addDownload(c);
		}
	}
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////

Peer.prototype.addDownload = function(c,peerID){

	//decide which peer to add...
	if(peerID===undefined && c===this.club){
		peerID = Math.floor(Math.random()*clubs[c].peers.length);
		while(clubs[c].peers[peerID]===undefined || clubs[c].peers[peerID]===this){
			peerID = Math.floor(Math.random()*clubs[c].peers.length);
		}
		clubs[c].peers[peerID].addUpload(this.club,this.id); //initiate if no id is specified
	}
	else if(peerID===undefined){
		peerID = Math.floor(Math.random()*clubs[c].peers.length);
		while(clubs[c].peers[peerID]===undefined || clubs[c].peers[peerID]===this || peerID===0){
			peerID = Math.floor(Math.random()*clubs[c].peers.length);
		}
		clubs[c].peers[peerID].addUpload(this.club,this.id); //initiate if no id is specified
	}

	//make the connection object
	var tempConnection = {
		'club':c,
		'id':peerID
	};

	//then append it
	if(c===this.club) this.inClub_download.push(tempConnection);
	else this.outClub_download[c] = tempConnection;
}

/////////////////////////////////////////////
/////////////////////////////////////////////
/////////////////////////////////////////////