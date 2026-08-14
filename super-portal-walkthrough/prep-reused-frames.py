"""Prepare the six frames reused from the original cut (14, 16, 21, 22, 24, 28).

Those screens either don't exist in the newer build or render differently from
what the narration describes, so they are lifted from the original video and
de-branded here.

Geometry note: frames 21, 22 and 28 carry an extra browser tab strip, which
pushes the whole page down 33px. Every position below is per-frame for that
reason - a single fixed offset leaves the client lockup visible underneath.

Leaks handled: sidebar lockup, omnibox host, tab-strip hosts (21/22/28),
Channel column values (21/22), letterhead (28).
"""
# Reference implementation - see build_v2.py for how the output is consumed.
# Frame extraction: ffmpeg -i <source> -vf "select='gte(t,T)',crop=1704:958:108:22"
FRAME_TIMES = {'14':132,'16':146,'21':193,'22':203,'24':225,'28':261}
SIDEBAR_DY  = {'14':0,'16':0,'24':0,'21':33,'22':33}      # tab-strip offset
LOGO_BOX    = (18,208,60,121)                              # +dy on y
OMNIBOX     = (600,12,1150,34)
TABSTRIP    = (575,48,1698,75)                             # 21, 22, 28 only
CHANNEL_COL = (1533,1697)                                  # 21, 22 only
LETTERHEAD  = (1118,124,1266,232)                          # 28 only
NEUTRAL_HOST = 'demo.superportal.local'
