"""Monte Carlo of the Ultimate Team economy: how many hours a player needs to hit each milestone.

Reads ultimate-team/data/economy.json. Usage: python3 ultimate-team/tools/economy_sim.py [players] [hours] [poolSize]
"""
import json, random, sys
from pathlib import Path

ECO = json.loads((Path(__file__).parent.parent / "data" / "economy.json").read_text())
E, P, R = ECO["earnings"], ECO["packs"], ECO["rarities"]
TIER = {"bronze": 0, "silver": 1, "gold": 2, "goldRare": 2, "holo": 2, "holoRare": 2, "holoEpic": 2, "numbered": 2, "oneOfOne": 2}

def make_pool(n, rng):
    # Base overall of each character: few stars, many mid cards, like a real roster.
    ovrs = sorted(int(rng.triangular(55, 91, 69)) for _ in range(n))
    by_tier = {0: [o for o in ovrs if o < 65], 1: [o for o in ovrs if 65 <= o < 75], 2: [o for o in ovrs if o >= 75]}
    for t in by_tier:
        if not by_tier[t]: by_tier[t] = [60 + 8 * t]
    stars = [o for o in ovrs if o >= R["numbered"]["minBaseOvr"]] or [max(ovrs)]
    return by_tier, stars

def draw(rarity, by_tier, stars, rng):
    if rarity in ("numbered", "oneOfOne"):
        base = rng.choice(stars)
    else:
        # Higher overalls are rarer inside a tier, like packs in FC (weight halves every ~3 points).
        pool = by_tier[TIER[rarity]]
        base = rng.choices(pool, weights=[0.8 ** (o - pool[0]) for o in pool])[0]
        if rarity == "goldRare": base = min(base + 2, 91)
    return rarity, base + R[rarity].get("ovrBonus", 0)

def open_pack(name, by_tier, stars, rng, state):
    p = P[name]; cards = []
    for i in range(p["cards"]):
        x, rarity = rng.random(), None
        for r, pr in p.get("special", {}).items():
            if x < pr: rarity = r; break
            x -= pr
        if not rarity:
            x, acc = rng.random(), 0
            for r, pr in p["odds"].items():
                acc += pr
                if x < acc: rarity = r; break
            rarity = rarity or list(p["odds"])[-1]
        cards.append(draw(rarity, by_tier, stars, rng))
    if name == "premiumGold":
        if not any(c[0].startswith("holo") for c in cards):
            state["pity"] += 1
            if state["pity"] >= ECO["pity"]["holoEveryPremiumPacks"]:
                cards[0] = draw("holo", by_tier, stars, rng); state["pity"] = 0
        else: state["pity"] = 0
    return cards

def sale_value(rarity, ovr):
    if not R[rarity].get("tradable", True): return 0
    mk = ECO["market"]
    if rarity in mk["basePrice"]:
        # Selling on the simulated market: below list price (fill time, tax), but beats quick sell.
        return max(R[rarity]["quickSell"], int(mk["basePrice"][rarity] * mk["cpuBuyerShare"] * (1 - mk["tax"])))
    return R[rarity]["quickSell"]

def simulate(hours, pool, rng, strategy):
    by_tier, stars = make_pool(pool, rng)
    club = [("silver", 66)] * 5          # starter squad
    credits, div, season, pts = 2000, 0, 0, 0
    state = {"pity": 0}; hit = {}
    def mark(k, h):
        hit.setdefault(k, h)
    for h in range(1, hours + 1):
        team = sum(o for _, o in sorted(club, key=lambda c: -c[1])[:5]) / 5
        credits += E["dailyObjectives"]["count"] * E["dailyObjectives"]["credits"] / E["dailyObjectives"]["dailyCapHours"]
        for _ in range(E["matchesPerHour"]):
            cpu = 58 + 4 * div
            pw = min(0.85, max(0.1, 0.45 + 0.025 * (team - cpu)))
            x = rng.random(); m = E["divisionMultiplier"][div]
            goals = rng.choice([0, 1, 1, 2, 2, 3, 4])
            if x < pw: credits += E["division"]["win"] * m; pts += 3
            elif x < pw + 0.2: credits += E["division"]["draw"] * m; pts += 1
            else: credits += E["division"]["loss"] * m
            credits += goals * E["division"]["perGoal"]
            season += 1
            if season == E["seasonMatches"]:
                credits += E["seasonReward"][div]
                if pts >= E["promotePoints"]: div = min(div + 1, 9)
                elif pts < E["holdPoints"]: div = max(div - 1, 0)
                season = pts = 0
        if div == 9: mark("divisione 1", h)
        while True:
            pack = "holo" if strategy == "holo" and credits >= P["holo"]["price"] else (
                "premiumGold" if credits >= P["premiumGold"]["price"] and strategy != "holo" else None)
            if not pack: break
            credits -= P[pack]["price"]
            for rarity, ovr in open_pack(pack, by_tier, stars, rng, state):
                mark(rarity, h)
                club.append((rarity, ovr))
            club.sort(key=lambda c: -c[1])
            keep, sold = club[:7], club[7:]   # 5 starters + 2 bench, the rest goes on the market
            keep += [c for c in sold if not R[c[0]].get("tradable", True)]
            credits += sum(sale_value(*c) for c in sold if R[c[0]].get("tradable", True))
            club = keep
        team = sum(o for _, o in club[:5]) / 5
        if team >= 80: mark("squadra 80+", h)
        if team >= 86: mark("squadra 86+", h)
        if team >= 90: mark("squadra 90+", h)
    return hit

def main():
    players = int(sys.argv[1]) if len(sys.argv) > 1 else 1500
    hours = int(sys.argv[2]) if len(sys.argv) > 2 else 400
    pool = int(sys.argv[3]) if len(sys.argv) > 3 else 40
    keys = ["goldRare", "holo", "squadra 80+", "holoRare", "divisione 1", "squadra 86+", "squadra 90+", "holoEpic", "numbered", "oneOfOne"]
    for strategy in ("premium", "holo"):
        rng = random.Random(7)
        runs = [simulate(hours, pool, rng, strategy) for _ in range(players)]
        print(f"\nStrategia: solo pacchetti {'Oro Premium' if strategy == 'premium' else 'Holo'}  ({players} giocatori, {hours} h, {pool} personaggi)")
        print(f"{'traguardo':<14}{'10%':>7}{'mediana':>9}{'90%':>7}{'mai':>8}")
        for k in keys:
            t = sorted(r[k] for r in runs if k in r)
            never = 1 - len(t) / players
            q = lambda f: (f"{t[int(f * players)]}h" if int(f * players) < len(t) else "-")
            print(f"{k:<14}{q(0.1):>7}{q(0.5):>9}{q(0.9):>7}{never:>8.0%}")

if __name__ == "__main__":
    main()
