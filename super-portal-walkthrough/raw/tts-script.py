from kokoro_onnx import Kokoro
import soundfile as sf, numpy as np, json

k = Kokoro("/root/.cache/hyperframes/tts/models/kokoro-v1.0.onnx",
           "/root/.cache/hyperframes/tts/voices/voices-v1.0.bin")

BANK = "the bank"
# (cue_start, target_end, text) — timings from the Emirates NBD cut
B = [
 (0.0, 13.0, f"Every application {BANK} receives arrives here — already verified, already enriched with identity, bureau and income data. This is Super Portal, from first sign-in to log-out."),
 (13.0, 29.0, "Every application arrives through a channel, and can be configured and scoped separately in all the modules — a direct sales team, a broker, an ecosystem partner, or a lead from social media."),
 (29.0, 41.0, "A product is defined in the portal, not in code: amount, tenor, minimum salary, age limit, and every pricing scheme beneath it."),
 (41.0, 73.0, "Pricing is authored in three guided steps. First the scheme — fixed or variable, floor and ceiling, EIBOR rates, and every fee. Then the factors that price differently: salary transfer, property status, transaction type, emirate. The result? One row for every combination. And History Version reprices any past application against the rules of its day."),
 (73.0, 95.0, "Every consent and disclosure is governed centrally — held once, used everywhere. Each document keeps its versions, so the wording a customer agreed to is always a lookup. Wording is edited here by the team that owns it, published only after a second approval."),
 (95.0, 142.0, "This is where credit policy lives. Applicants are divided into populations judged differently, each with its own age band and review posture. Each attribute switches on with its own condition and value — plain rows, readable by the policy owner. Attributes come from one governed library, nothing typed free-form, so nothing drifts. Inside a segment, filtration sharpens it: nationality, employment, age, income, length of service. Deviation allows a defined, formula-bound breach of policy — discretion always on the record."),
 (142.0, 156.0, "Nothing is live until it is explicitly pushed to the Rule Engine. Confirmed — the new policy now decides live applications. A release cycle done in an afternoon."),
 (156.0, 187.0, f"Sixty-three calculated variables decide how much: debt burden, affordability, approved limit — written as readable mathematics. The multiplier is tuned per group, published as a numbered version, reversible in seconds. And whatever the formula returns, the boundary holds it: no calculation can put {BANK} outside its own appetite."),
 (187.0, 194.0, "Sometimes the right answer is more than the customer asked for. Higher Offer, switched on per product and channel."),
 (194.0, 213.0, "The other half is being able to answer for it. Any application by ID, Emirates ID, email or phone. One email, two applications — type, status, nationality and channel on the row."),
 (213.0, 235.0, "The case opens read-only: income, debt service, bureau score, rule-engine result. One screen, no interpretation required. The bureau picture in full — exposure, contracts, payment delays, every cheque bounce."),
 (235.0, 252.0, "Every step opens into its reasoning — pass, criterion by criterion. Nothing to ask engineering. Open one offer and the whole calculation is there — every number and where it came from."),
 (252.0, 264.0, "The evidence, gathered once: Emirates ID, selfie, signature, bureau report, and what the customer consented to and when."),
 (264.0, 271.0, "The letter is generated the moment an offer is accepted — emailed, filed, and itself an audit entry."),
 (271.0, 289.0, "Genuine exceptions reach a person, routed to a higher credit queue with the handover recorded. Override, not bypass — recalculated live, always inside policy bounds, never without a reason."),
 (289.0, 322.0, "Every user carries a role, a scope, an authority level, and a reporting manager. Seeing customer data is a deliberate grant — off by default, dual approved. Without it, protected sections are removed. Not blurred — removed. A role is a named bundle of permissions, every grant explicit, nothing inherited by accident."),
 (322.0, 328.0, "The session ends. Everything done inside it stays attributed to a named person at a recorded time."),
 (328.0, 342.67, f"Eleven modules, one platform. The bank sets the policy, prices the product, decides the case, and can prove exactly why. That is Super Portal."),
]

VOICE, SR = "bm_george", 24000
rows = []
for i,(start,end,text) in enumerate(B, 1):
    target = end - start
    samples, sr = k.create(text, voice=VOICE, speed=1.0, lang="en-gb")
    nat = len(samples)/sr
    speed = round(max(0.7, min(1.6, nat/target)), 3)   # speed needed to fit the slot
    sf.write(f"vo/blk{i:02d}.wav", samples, sr)
    rows.append({"blk":i,"start":start,"slot":round(target,2),"natural":round(nat,2),"speed_to_fit":speed})
    print(f"{i:2}  slot {target:6.2f}s   natural {nat:6.2f}s   needs speed {speed}", flush=True)

json.dump(rows, open("vo/timing.json","w"), indent=1)
tot_nat = sum(r["natural"] for r in rows)
print(f"\nTOTAL natural {tot_nat:.1f}s vs video 342.67s  -> global speed {tot_nat/342.67:.3f}")
