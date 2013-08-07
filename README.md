#BitTorrent Live

###A Visualization for how the Live Protocol works

The screen in the center is the Source, and all smaller screens are Peers. When a new Peer is added, it joins one of the six Clubs.

Life of a Packet:

1) The Source creates a new packet, and sends that packet to only one of the clubs over a Screamer Protocol (fast/unreliable).

2) When the Source sends this packet, it only does so to 2-3 Peers in that club, putting a low ceiling on its upload bandwidth.

3) The receiving 2-3 Peers in that Club then Scream this new Packet inside that Club, to ensure everyone in the Club gets it.

4) When a peer has no one else to pass the packet to in its own Club, it sends the new Packet to Peers in the other five clubs over a more secure, but slow, protocol.