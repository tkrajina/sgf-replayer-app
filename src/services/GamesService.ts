import { Game, Settings } from "../models";
import { parseSGFCollection } from "../sgf/parser";
import { SGFNode, Tag } from "../sgf/sgf";
import { Observable } from "../utils/observable";

export const GAMES = "sgf_replay_games";
export const SETTINGS = "sgf_replay_settings";

class GamesService {

	todayCounter = new Observable(0);

	lastOpened: number = -1;

	constructor() {
		if (localStorage.getItem(GAMES) === null) {
			this.saveSGFCollection(`
(;GM[1]FF[4]SZ[19]CA[utf-8]PW[Immortal]PB[Immortal]EV[(The Mountain of) the Rotten Axe Handle]RE[B+1]AB[dd][pp]AW[pd][dp];W[fc];B[fe];W[ic];B[eb];W[fb];B[ie];W[ed];B[ee];W[de];B[cd];W[ce];B[be];W[bf];B[bd];W[cg];B[dg];W[ci];B[db];W[ei];B[jc];W[jb];B[hc];W[id];B[hd];W[hb];B[jd];W[ib];B[lc];W[kb];B[le];W[lb];B[mc];W[nb];B[cm];W[em];B[el];W[fl];B[en];W[dl];B[fn];W[co];B[cn];W[gp];B[hn];W[jp];B[lq];W[lp];B[mp];W[lo];B[kq];W[jq];B[mo];W[jn];B[bk];W[hl];B[ep];W[eq];B[fp];W[fq];B[gq];W[hq];B[gr];W[dq];B[hp];W[go];B[ho];W[hr];B[bo];W[bp];B[do];W[cp];B[gn];W[gs];B[bi];W[bh];B[cj];W[ai];B[bj];W[di];B[fo];W[gp];B[im];W[jk];B[jm];W[km];B[kl];W[jl];B[lm];W[kn];B[ll];W[if];B[he];W[jf];B[je];W[lg];B[hg];W[ek];B[jh];W[lj];B[oc];W[nc];B[od];W[nd];B[oe];W[ne];B[kg];W[of];B[pe];W[pf];B[qe];W[qf];B[ob];W[re];B[rd];W[rf];B[lh];W[rc];B[sd];W[qd];B[qc];W[se];B[pc];W[qd];B[pd];W[sc];B[qd];W[oa];B[qb];W[pa];B[sb];W[ql];B[go];W[fr];B[qj];W[ok];B[oi];W[mh];B[ng];W[nf];B[mg];W[nh];B[og];W[oh];B[pg];W[ph];B[qg];W[qh];B[rg];W[rh];B[sg];W[fa];B[qn];W[lf];B[mf];W[kf];B[me];W[li];B[kh];W[ih];B[ig];W[ji];B[hh];W[ii];B[jg];W[mn];B[nn];W[nm];B[pl];W[on];B[no];W[oo];B[nq];W[pm];B[qm];W[qk];B[mm];W[op];B[oq];W[po];B[qo];W[ol];B[nl];W[om];B[ln];W[qp];B[pq];W[rp];B[ro];W[rr];B[qr];W[rq];B[rs];W[rm];B[rl];W[rk];B[sp];W[kr];B[lr];W[jr];B[mk];W[dm];B[dn];W[cl];B[bl];W[bn];B[bm];W[ao];B[aj];W[da];B[cb];W[ea];B[ca];W[mj];B[sh];W[si];B[kp];W[ko];B[hi];W[hj];B[gj];W[hk];B[ef];W[cf];B[dh];W[ch];B[gk];W[gl];B[fh];W[ec];B[dc];W[fi];B[gi];W[eh];B[eg];W[ls];B[ms];W[ks];B[mq];W[mb];B[gc];W[gb];B[nk];W[nj];B[lk];W[ah];B[af];W[ag];B[ae];W[rn];B[sr];W[pn];B[so];W[sl];B[sq];W[sn];B[qq];W[qa];B[ra];W[fd];B[gf];W[kc];B[kd];W[md];B[ld];W[gd];B[il];W[ik];B[kj];W[ki];B[kk];W[gp];B[jj];W[ij];B[dj];W[ej];B[gq];W[ge];B[am];W[an];B[ip];W[iq];B[fg];W[bc];B[bb];W[ab];B[ac];W[ad];B[aa];W[na];B[rb])
(;GM[1]FF[4]SZ[19]CA[utf-8]PB[Sun Ce]PW[Lue Fan]DT[?196 AD]PC[China]RE[Void]AB[dp][pd]AW[pp][dd]GC[Sun Ce summons Lue Fan to play go ?196 AD];W[qf];B[mc];W[of];B[qk];W[qi];B[qn];W[qo];B[pn];W[mq];B[kq];W[kc];B[re];W[rf];B[hq];W[cn];B[ci];W[ck];B[cf];W[fq];B[fp];W[cq];B[dq];W[cp];B[cr];W[br];B[dr];W[ce];B[df];W[gc];B[qq];W[pq];B[ro];W[rp];B[qp];W[rq];B[po];W[qr];B[bl];W[cm];B[bk];W[le];B[oc];W[fe])
`)
		}
	}

	loadSettings() {
		return JSON.parse(localStorage.getItem(SETTINGS)) as Settings || new Settings();
	}

	saveSettings(settings: Settings) {
		localStorage.setItem(SETTINGS, JSON.stringify(settings));
	}

	loadGames() {
		let games: Game[] = [];
		try {
			games = JSON.parse(localStorage.getItem(GAMES)) as Game[];
		} catch (e) {
			console.error(e);
		}
		if (!games) {
			return [];
		}
		return games;
	}

	saveGame(n: number, game: Game) {
		const games = this.loadGames();
		games[n] = game;
		localStorage.setItem(GAMES, JSON.stringify(games))
	}

	saveSGFCollection(sgfStr: string) {
		const sgfCollection = parseSGFCollection(sgfStr);
		const games = this.loadGames();
		for (const sgf of sgfCollection) {
			const game = new Game();
			this.reloadGame(game, sgf);
			games.push(game);
		}
		localStorage.setItem(GAMES, JSON.stringify(games))
	}

	delete(game: Game) {
		let games = this.loadGames();
		games = games.filter(g => g.sgf != game.sgf);
		localStorage.setItem(GAMES, JSON.stringify(games))
	}

	reloadGame(game: Game, node: SGFNode) {
		game.sgf = node.toSGF();
		game.white = node.getProperty(Tag.WhiteName)
		game.black = node.getProperty(Tag.BlackName)
		game.whiteRank = node.getProperty(Tag.WhiteRank)
		game.blackRank = node.getProperty(Tag.BlackRank)
		game.event = node.getProperty(Tag.Event)
		game.date = node.getProperty(Tag.Date)
		game.result = node.getProperty(Tag.Result)
	}
}

export const gamesService = new GamesService();
