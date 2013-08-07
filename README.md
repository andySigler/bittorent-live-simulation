#BitTorrent Live

###A Visualization for how the Live Protocol works

The screen in the center is the Source, and all smaller screens are Peers. When a new Peer is added, it joins one of the six Clubs.

The larger Red dots represent Packets sent over a Screamer Protocol, while the smaller Black dots represent packets being sent between different Clubs over a more secure/slow protocol.

###Life of a Packet:

1) The Source creates a new packet, and sends that packet to only one of the clubs over a Screamer Protocol (fast/unreliable).

2) When the Source sends this packet, it only does so to 2-3 Peers in that club, putting a low ceiling on its upload bandwidth.

3) The receiving 2-3 Peers in that Club then Scream this new Packet to 2-3 other Peers inside that Club. Those 2-3 Peers then Scream the Packet to 2-3 Peers inside that Club, creating a chain reaction, until everyone one in the Club has that Packet.

4) When a Peer has no one else to Scream the packet to in its own Club, it sends Packets it has received to Peers in the other five clubs over a more secure, but slow, protocol.