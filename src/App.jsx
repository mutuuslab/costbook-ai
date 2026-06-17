import { useState, useEffect } from "react";
import {
  C, REFS, DOMAINS, DT, CX, ASIL, CYBER, OTA_C, VAR, VEH, ASP_L,
  S_MECHS, IMPLS, GATES, calc, calcQ, INIT_F,
} from "./engine.js";

// ═══ SHARED UI ═══
function Badge({children,color=C.navy}){return <span style={{display:"inline-block",fontSize:10,fontWeight:600,padding:"2px 7px",borderRadius:4,color,background:color+"15",whiteSpace:"nowrap"}}>{children}</span>;}
function RefTag({ids}){const[o,sO]=useState(false);if(!ids?.length)return null;return(<span style={{position:"relative",display:"inline-block"}}><button onClick={e=>{e.stopPropagation();sO(!o);}} style={{background:"none",border:`1px solid ${C.amber}40`,borderRadius:3,padding:"1px 5px",fontSize:9,color:C.amber,cursor:"pointer",fontFamily:"monospace"}}>{ids.join(",")}</button>{o&&<div onClick={e=>e.stopPropagation()} style={{position:"absolute",top:"100%",left:0,zIndex:99,background:C.w,border:`1px solid ${C.g1}`,borderRadius:6,padding:10,width:280,boxShadow:"0 4px 16px #0001",fontSize:10}}>{ids.map(id=>{const r=REFS[id];return r?<div key={id} style={{marginBottom:4}}><strong style={{color:C.navy}}>{id}</strong>: {r.s} — <span style={{color:C.g5}}>{r.d}</span></div>:null;})}<button onClick={()=>sO(false)} style={{fontSize:9,color:C.g3,background:"none",border:"none",cursor:"pointer"}}>닫기</button></div>}</span>);}
function Sel({value,onChange,opts}){return <select value={value} onChange={e=>onChange(e.target.value)} style={{padding:"5px 6px",borderRadius:4,border:`1px solid ${C.g1}`,fontSize:11,background:C.w,color:C.g7}}>{opts.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select>;}
function Bar({value,max,color=C.navy,h=6}){return <div style={{background:C.g1,borderRadius:h/2,height:h,overflow:"hidden",flex:1}}><div style={{width:`${Math.min((value/max)*100,100)}%`,height:"100%",background:color,borderRadius:h/2,transition:"width 0.4s"}}/></div>;}
function fmt(v){return Math.abs(v)>=10000?`${(v/10000).toFixed(1)}억`:`${Math.abs(v).toLocaleString()}만`;}
function Radar({scores,size=160}){const L=Object.keys(scores),n=L.length,mx=size/2,my=size/2,r=size*.34,step=(2*Math.PI)/n,st=-Math.PI/2;const pt=(i,v)=>{const a=st+i*step,d=(v/100)*r;return[mx+d*Math.cos(a),my+d*Math.sin(a)];};return(<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>{[25,50,75,100].map(lv=>(<polygon key={lv} points={L.map((_,i)=>pt(i,lv).join(",")).join(" ")} fill="none" stroke={C.g1} strokeWidth={1}/>))}{L.map((_,i)=>{const p=pt(i,100);return(<line key={"l"+i} x1={mx} y1={my} x2={p[0]} y2={p[1]} stroke={C.g1} strokeWidth={1}/>);})}<polygon points={L.map((_,i)=>pt(i,scores[L[i]]).join(",")).join(" ")} fill={C.navy+"28"} stroke={C.navy} strokeWidth={2}/>{L.map((l,i)=>{const p=pt(i,118);return(<text key={"t"+i} x={p[0]} y={p[1]} textAnchor="middle" dominantBaseline="middle" fontSize={8} fill={C.g5} fontWeight={600}>{l}</text>);})}</svg>);}

// ★ COLLAPSIBLE GUIDE COMPONENT ★
function Guide({title,children,step}){
  const[open,setOpen]=useState(false);
  return(<div style={{marginBottom:12,border:`1px solid ${C.blue}20`,borderRadius:8,overflow:"hidden"}}>
    <button onClick={()=>setOpen(!open)} style={{width:"100%",padding:"8px 12px",background:C.blue+"08",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:8,textAlign:"left"}}>
      {step&&<span style={{width:22,height:22,borderRadius:"50%",background:C.navy,color:C.w,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0}}>{ step}</span>}
      <span style={{fontSize:12,fontWeight:600,color:C.navy,flex:1}}>{title}</span>
      <span style={{fontSize:11,color:C.g3}}>{open?"▲ 접기":"▼ 가이드라인 보기"}</span>
    </button>
    {open&&<div style={{padding:"10px 14px",fontSize:11,color:C.g7,lineHeight:1.8,background:C.w}}>{children}</div>}
  </div>);
}

const TABS=[{id:"feat",l:"① Feature"},{id:"arch",l:"② 아키텍처"},{id:"qual",l:"③ 품질"},{id:"gap",l:"④ Gap·계약"},{id:"cr",l:"⑤ CR"},{id:"gate",l:"⑥ 증적Gate"},{id:"act",l:"⑦ 실적보정"},{id:"ref",l:"참조"},{id:"dash",l:"대시보드"}];

// ═══ T1: Features ═══
function T1({F,sF}){
  const[ei,sEi]=useState(null);
  const upd=(i,k,v)=>{const n=[...F];n[i]={...n[i],[k]:k==="size"?Number(v):v};sF(n);};
  return(<div>
    <Guide title="Feature 등록 가이드라인" step="1">
      <div><strong style={{color:C.navy}}>Cost Object = Feature ID</strong> — 프로젝트 총액이 아닌 기능 단위로 비용을 산정합니다.</div>
      <div style={{marginTop:6}}><strong>Feature ID 부여 규칙:</strong> FTR-001 형식. 하나의 Feature는 독립적으로 개발·검증·납품 가능한 최소 기능 단위입니다.</div>
      <div style={{marginTop:6}}><strong>기능규모(FP) 산정:</strong> IFPUG 또는 간이 FP 방법 사용. 입력/출력/조회/내부파일/외부파일 수를 기반으로 산출합니다. 초기에는 유사 기능 대비 상대 규모로 추정해도 됩니다.</div>
      <div style={{marginTop:6}}><strong>도메인 선택 기준:</strong> 해당 Feature가 속한 차량 도메인. 도메인에 따라 생산성(h/FP), 검증비율, 단가가 자동 적용됩니다.</div>
      <div style={{marginTop:8,padding:8,background:C.amber+"10",borderRadius:4}}><strong style={{color:C.amber}}>개발유형 판정 로직:</strong>
        <div>· 코드 변경 없음 + 동일 플랫폼/ECU/IF → <strong>Reuse As-Is</strong></div>
        <div>· 코드 변경 없음 + 대상 차종 변경 + Cal/Variant 확인 → <strong>CO 재검증</strong></div>
        <div>· 코드 일부 변경 + IF 또는 Cal 수정 → <strong>CO 수정</strong></div>
        <div>· 기존 기능 기반 + 요구사항 변경 큼 → <strong>Reuse 수정</strong></div>
        <div>· 완전 신규 → <strong>신규개발</strong></div>
      </div>
      <div style={{marginTop:6}}><strong>ASIL 설정:</strong> HARA 결과에 따라 배정. QM(비안전) ~ D(최고). ASIL이 높을수록 개발·검증 비용 증가.</div>
      <div style={{marginTop:6}}><strong>Variant:</strong> SINGLE(단일 차종) ~ COMPLEX(9종+). 차종/트림/지역 조합 수에 따라 통합 검증 비용 증가.</div>
      <div style={{marginTop:6}}><strong>차종적용:</strong> 동일 플랫폼이면 SAME, ECU 변경이 있으면 DIFF_ECU, Safety 증적 재검토가 필요하면 SAFETY_RE.</div>
    </Guide>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
      <div style={{fontSize:14,fontWeight:700,color:C.navy}}>Feature Register</div>
      <button onClick={()=>{sF([...F,{id:`FTR-${String(F.length+1).padStart(3,"0")}`,name:"새 기능",domain:"BODY",devType:"NEW",complexity:"MID",size:100,asil:"QM",cyber:"NONE",ota:"NONE",variant:"SINGLE",vehicleApp:"SAME"}]);sEi(F.length);}} style={{padding:"6px 12px",background:C.navy,color:C.w,border:"none",borderRadius:5,fontSize:11,cursor:"pointer"}}>+ 추가</button>
    </div>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
      <thead><tr style={{background:C.g05}}>{["ID","기능명","도메인","유형","복잡도","규모","ASIL","Cyber","OTA","Var","차종",""].map(h=><th key={h} style={{padding:"6px 3px",textAlign:"left",color:C.g5,fontWeight:600,borderBottom:`1px solid ${C.g1}`,fontSize:10}}>{h}</th>)}</tr></thead>
      <tbody>{F.map((f,i)=>{const ed=ei===i;return(<tr key={f.id} style={{background:ed?C.navy+"06":C.w,borderBottom:`1px solid ${C.g05}`}}>
        <td style={{padding:4,fontFamily:"monospace",fontWeight:600,color:C.navy}}>{f.id}</td>
        <td style={{padding:4,minWidth:90}}>{ed?<input value={f.name} onChange={e=>upd(i,"name",e.target.value)} style={{width:"100%",padding:2,border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11}}/>:<span style={{color:C.g7}}>{f.name}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.domain} onChange={v=>upd(i,"domain",v)} opts={Object.entries(DOMAINS).map(([k,v])=>[k,v.n])}/>:<Badge color={DOMAINS[f.domain]?.color}>{DOMAINS[f.domain]?.n}</Badge>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.devType} onChange={v=>upd(i,"devType",v)} opts={Object.entries(DT).map(([k,v])=>[k,v.l])}/>:<span style={{fontSize:10}}>{DT[f.devType]?.l}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.complexity} onChange={v=>upd(i,"complexity",v)} opts={Object.entries(CX).map(([k,v])=>[k,v.l])}/>:<Badge color={CX[f.complexity]?.color}>{CX[f.complexity]?.l}</Badge>}</td>
        <td style={{padding:4}}>{ed?<input type="number" value={f.size} onChange={e=>upd(i,"size",e.target.value)} style={{width:45,padding:2,border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11}}/>:<span style={{fontFamily:"monospace"}}>{f.size}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.asil} onChange={v=>upd(i,"asil",v)} opts={Object.keys(ASIL).map(k=>[k,k])}/>:<Badge color={f.asil>="C"?C.red:f.asil==="QM"?C.g5:C.amber}>{f.asil}</Badge>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.cyber} onChange={v=>upd(i,"cyber",v)} opts={Object.keys(CYBER).map(k=>[k,k])}/>:<span style={{fontSize:10,color:C.g5}}>{f.cyber}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.ota} onChange={v=>upd(i,"ota",v)} opts={Object.keys(OTA_C).map(k=>[k,k])}/>:<span style={{fontSize:10,color:C.g5}}>{f.ota}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.variant} onChange={v=>upd(i,"variant",v)} opts={Object.keys(VAR).map(k=>[k,k])}/>:<span style={{fontSize:10,color:C.g5}}>{f.variant}</span>}</td>
        <td style={{padding:4}}>{ed?<Sel value={f.vehicleApp} onChange={v=>upd(i,"vehicleApp",v)} opts={Object.entries(VEH).map(([k])=>[k,k])}/>:<span style={{fontSize:10,color:C.g5}}>{f.vehicleApp}</span>}</td>
        <td style={{padding:4}}><button onClick={()=>sEi(ed?null:i)} style={{padding:"2px 6px",border:`1px solid ${C.g1}`,borderRadius:3,background:C.w,fontSize:10,cursor:"pointer"}}>{ed?"✓":"편집"}</button></td>
      </tr>);})}</tbody>
    </table></div>
  </div>);
}

// ═══ T2: Architecture ═══
function T2({F,ac,sAc,mech,sMech,asp}){
  const[fi,sFi]=useState(0);const f=F[fi];
  const c3=IMPLS.map(o=>calc(f,mech,o.id,asp));const mx=Math.max(...c3.map(c=>c.should));
  const ci=ac[f.id]||"sw",cc=calc(f,mech,ci,asp);
  return(<div>
    <Guide title="아키텍처 기반 비용 산정 가이드라인" step="2">
      <div><strong style={{color:C.navy}}>파이프라인:</strong> ASIL 배정(Feature에서 설정) → FSC 안전 메커니즘 선택 → TSC HW/SW 배분 → Should-Cost 자동 산정</div>
      <div style={{marginTop:8}}><strong>안전 메커니즘 선택 기준 (ISO 26262-3 §8):</strong></div>
      <div>· <strong>이중화:</strong> 단일 고장 허용이 필요할 때. 중복 HW/SW 요소 → 비용 최대 (×1.30). 예: 이중 채널 브레이크 ECU</div>
      <div>· <strong>모니터링+진단:</strong> Watchdog, Plausibility Check로 고장 감지 → 중간 비용 (×1.15). 예: 센서 값 교차 검증</div>
      <div>· <strong>단계적 축소:</strong> 고장 시 안전 상태로 전환 (Limp-home) → 비용 최소 (×1.10). 주로 SW 모드 관리</div>
      <div style={{marginTop:8}}><strong>구현 배분 기준 (ISO 26262-4 §7):</strong></div>
      <div>· <strong>HW 배분:</strong> 전용 칩/회로로 구현. 재료비 높지만 신뢰성 최고. ADAS 센서 처리에 적합</div>
      <div>· <strong>외부 시스템:</strong> 기존 ECU에 안전 기능 위임. 통합 비용 발생하지만 재료비 절감</div>
      <div>· <strong>SW 배분:</strong> 소프트웨어로 구현. 유연성 최고, 리드타임 최단. 고성능 칩 필요할 수 있음</div>
      <div style={{marginTop:8,padding:8,background:C.green+"10",borderRadius:4}}><strong style={{color:C.green}}>가격 프로그레스바 해석:</strong> 세 가지 구현 방식의 총 비용을 시각적으로 비교합니다. 바가 길수록 비용이 높습니다. 하단의 비용 구성(재료/SW/검증/도구/통합/리스크) 비율이 구현 방식마다 다르게 나타납니다.</div>
    </Guide>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
      {F.map((ft,i)=>(<button key={ft.id} onClick={()=>sFi(i)} style={{padding:"3px 9px",borderRadius:12,border:`1.5px solid ${fi===i?C.navy:C.g1}`,background:fi===i?C.navy:C.w,color:fi===i?C.w:C.g5,fontSize:10,cursor:"pointer"}}>{ft.id}</button>))}
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10,color:C.g5,marginBottom:4,fontWeight:600}}>안전 메커니즘 (FSC) <RefTag ids={["R26","R28"]}/></div>
      <div style={{display:"flex",gap:6}}>{S_MECHS.map(sm=>(<button key={sm.id} onClick={()=>sMech(sm.id)} style={{flex:1,padding:"7px",borderRadius:6,border:`2px solid ${mech===sm.id?C.navy:C.g1}`,background:mech===sm.id?C.navy+"08":C.w,cursor:"pointer",textAlign:"center"}}><div style={{fontSize:11,fontWeight:600,color:mech===sm.id?C.navy:C.g7}}>{sm.l}</div><div style={{fontSize:9,color:C.g5}}>{sm.desc}</div><div style={{fontSize:11,fontWeight:700,color:C.navy}}>×{sm.mul}</div></button>))}</div>
    </div>
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10,color:C.g5,marginBottom:4,fontWeight:600}}>TSC 구현 배분 <RefTag ids={["R27","R29"]}/></div>
      <div style={{display:"flex",gap:8}}>{IMPLS.map((opt,oi)=>{const cost=c3[oi];const isSel=ci===opt.id;return(<div key={opt.id} onClick={()=>{const n={...ac};n[f.id]=opt.id;sAc(n);}} style={{flex:1,border:`2px solid ${isSel?C.navy:C.g1}`,borderRadius:8,padding:10,cursor:"pointer",background:isSel?C.navy+"06":C.w}}>
        <div style={{textAlign:"center",marginBottom:6}}><div style={{fontSize:18}}>{opt.icon}</div><div style={{fontSize:11,fontWeight:700,color:C.navy}}>{opt.l}</div><div style={{fontSize:9,color:C.g5}}>{opt.desc}</div></div>
        <div style={{marginBottom:6}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}><span style={{fontSize:9,color:C.g5}}>총 비용</span><span style={{fontSize:14,fontWeight:700,color:C.navy}}>{fmt(cost.should)}</span></div>
        <div style={{background:C.g1,borderRadius:4,height:10,overflow:"hidden"}}><div style={{width:`${(cost.should/mx)*100}%`,height:"100%",borderRadius:4,transition:"width 0.5s",background:`linear-gradient(90deg,${C.blue},${cost.should/mx>0.8?C.red:C.navy})`}}/></div></div>
        {[{l:"재료",p:opt.matP,c:"#78909C"},{l:"SW",p:opt.swP,c:C.blue},{l:"검증",p:opt.testP,c:C.amber},{l:"도구",p:opt.toolP,c:C.purple},{l:"통합",p:opt.integP,c:C.teal},{l:"리스크",p:opt.riskP,c:C.red}].map(it=>(<div key={it.l} style={{marginBottom:2}}><div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:C.g5}}><span>{it.l}</span><span>{Math.round(it.p*100)}%</span></div><Bar value={it.p*100} max={55} color={it.c} h={3}/></div>))}
      </div>);})}</div>
    </div>
    {cc.isCO&&cc.coB&&(<div style={{background:"#FFF3E0",borderRadius:6,padding:8,marginBottom:8,border:`1px solid ${C.amber}30`,fontSize:10}}>
      <strong style={{color:C.amber}}>⚠ {DT[f.devType].l}: 개발비 ≠ 0원 (신규 대비 {cc.coB.save}% 절감)</strong>
      <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:3,marginTop:4,fontSize:9}}>
        {[{l:"코드",h:cc.coB.coding},{l:"적용성",h:cc.coB.analysis},{l:"통합",h:cc.coB.integ},{l:"Cal",h:cc.coB.cal},{l:"문서",h:cc.coB.doc},{l:"릴리스",h:cc.coB.rel}].map(a=>(<div key={a.l} style={{background:C.w,borderRadius:3,padding:3,textAlign:"center"}}><div style={{color:C.g5}}>{a.l}</div><div style={{fontWeight:700,fontFamily:"monospace"}}>{a.h}h</div></div>))}
      </div>
    </div>)}
    <div style={{background:C.g0,borderRadius:6,padding:8,fontSize:10}}>
      <div style={{fontFamily:"monospace",color:C.g7,lineHeight:1.7}}>
        보정공수 = {f.size}×{DOMAINS[f.domain].prod}×SF{cc.sf}×유형{cc.co.dc}×복잡도{cc.co.cc}×Var{cc.co.vc}×차종{cc.co.ve} = <strong>{cc.adjH}h</strong><br/>
        개발비={fmt(cc.devCost)} + 직접비={fmt(cc.dirCost)} + 검증비={fmt(cc.vCost)} + 통합={fmt(cc.iCost)} + 도구={fmt(cc.tCost)} + 리스크={fmt(cc.rCost)}<br/>
        × 구현배분{cc.co.im} = <strong style={{color:C.navy,fontSize:12}}>Should-Cost {fmt(cc.should)}</strong>
      </div>
    </div>
  </div>);
}

// ═══ T3: Quality ═══
function T3({F,ac,mech,asp}){
  const[fi,sFi]=useState(0);const f=F[fi];const cost=calc(f,mech,ac[f.id]||"sw",asp);const eSWC=Math.round(cost.adjH/12);
  const[aS,sAS]=useState(eSWC);const[dy,sDy]=useState(65);const[ts,sTs]=useState(75);const[st,sSt]=useState(90);const[dd,sDd]=useState(3.0);const[dl,sDl]=useState(4);
  useEffect(()=>{sAS(eSWC);},[fi,eSWC]);
  const swcS=aS<=eSWC?Math.min(100,Math.round(((eSWC-aS)/eSWC)*200+60)):Math.max(0,Math.round(60-((aS-eSWC)/eSWC)*100));
  const q=calcQ({swc:swcS,dyn:Math.min(100,dy),test:Math.min(100,ts),stat:Math.min(100,st),def:dd<=1?100:dd<=3?80:dd<=6?50:20,del:dl<=2?100:dl<=4?80:dl<=8?50:30});
  const gc=q.g==="A"?C.green:q.g==="B"?C.navy:q.g==="C"?C.amber:C.red;
  return(<div>
    <Guide title="설계 품질 평가 & 인센티브 가이드라인" step="3">
      <div><strong style={{color:C.navy}}>6개 지표로 평가합니다.</strong> 각 지표는 가중치가 있으며, 종합 점수에 따라 A~D 등급이 결정됩니다.</div>
      <div style={{marginTop:6}}><strong>① 정적 아키텍처 효율 (20%):</strong> 기준 SWC 수 대비 실제 설계 SWC 수. 적을수록 점수 높음 → "같은 기능을 더 적은 컴포넌트로 구현"한 것이 기술력.</div>
      <div><strong>② 동적뷰 커버리지 (15%):</strong> 시퀀스 다이어그램, 상태 머신 등 동적 설계 산출물의 커버리지 %. ASPICE SWE.3 기반.</div>
      <div><strong>③ 테스트 커버리지 (20%):</strong> 요구사항 대비 테스트 커버리지. ASPICE SWE.5 기반. 80% 이상이 우수.</div>
      <div><strong>④ 정적 분석 통과율 (15%):</strong> MISRA, Polyspace 등 정적 분석 결과. 95% 이상이 우수. DRE 향상의 핵심 수단.</div>
      <div><strong>⑤ 결함 밀도 (15%):</strong> defects/KLOC. 1 이하가 우수, 3 이하가 보통. Capers Jones 품질 지표.</div>
      <div><strong>⑥ 딜리버리 주기 (15%):</strong> 빌드 납품 주기. 2주 이하가 Agile 수준, 4주 이하가 준수.</div>
      <div style={{marginTop:8,padding:8,background:C.green+"10",borderRadius:4}}>
        <strong style={{color:C.green}}>인센티브 구조 (R25 Toyota VE/DoD CPIF 참조):</strong>
        <div>· A등급(≥85점): +15% — 양산 후 6개월 필드 이슈 기준 달성 시 지급</div>
        <div>· B등급(≥70점): +10% · C등급(≥55점): +3% · D등급: 0%</div>
        <div>· 지급 구조: 기본 75% + 마일스톤 25% + 양산후 인센티브</div>
      </div>
    </Guide>
    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>{F.map((ft,i)=>(<button key={ft.id} onClick={()=>sFi(i)} style={{padding:"3px 9px",borderRadius:12,border:`1.5px solid ${fi===i?C.navy:C.g1}`,background:fi===i?C.navy:C.w,color:fi===i?C.w:C.g5,fontSize:10,cursor:"pointer"}}>{ft.id}</button>))}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
      <div>{[{l:`SWC(기준:${eSWC})`,v:aS,s:sAS,mn:20,mx:Math.round(eSWC*2),d:`${aS}개`,w:"20%"},{l:"동적뷰",v:dy,s:sDy,mn:0,mx:100,d:`${dy}%`,w:"15%"},{l:"테스트",v:ts,s:sTs,mn:0,mx:100,d:`${ts}%`,w:"20%"},{l:"정적분석",v:st,s:sSt,mn:0,mx:100,d:`${st}%`,w:"15%"},{l:"결함밀도",v:dd*10,s:v=>sDd(Number((v/10).toFixed(1))),mn:0,mx:100,d:`${dd}`,w:"15%"},{l:"딜리버리(주)",v:dl,s:sDl,mn:1,mx:12,d:`${dl}주`,w:"15%"}].map(x=>(<div key={x.l} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:C.g7}}>{x.l} ({x.w})</span><span style={{fontWeight:700,color:C.navy,fontFamily:"monospace"}}>{x.d}</span></div><input type="range" min={x.mn} max={x.mx} value={x.v} onChange={e=>x.s(Number(e.target.value))} style={{width:"100%",accentColor:C.navy}}/></div>))}</div>
      <div>
        <div style={{textAlign:"center"}}><Radar scores={{"아키텍처":swcS,"동적뷰":Math.min(100,dy),"테스트":Math.min(100,ts),"정적분석":Math.min(100,st),"결함":dd<=1?100:dd<=3?80:50,"딜리버리":dl<=2?100:dl<=4?80:50}} size={155}/></div>
        <div style={{textAlign:"center",margin:"4px 0"}}><span style={{fontSize:36,fontWeight:700,color:gc}}>{q.g}</span><span style={{fontSize:14,color:C.g5,marginLeft:4}}>{q.t}점</span></div>
        <div style={{background:gc+"10",border:`1px solid ${gc}25`,borderRadius:8,padding:10}}>
          <div style={{textAlign:"center",fontSize:22,fontWeight:700,color:gc}}>+{q.inc}%</div>
          <div style={{borderTop:`1px solid ${gc}20`,paddingTop:6,marginTop:4,fontSize:10,color:C.g7,lineHeight:1.7}}>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>① 기본(75%)</span><span style={{fontFamily:"monospace"}}>{fmt(Math.round(cost.should*.75))}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span>② 마일스톤(25%)</span><span style={{fontFamily:"monospace"}}>{fmt(Math.round(cost.should*.25))}</span></div>
            <div style={{display:"flex",justifyContent:"space-between",color:C.green}}><span>③ 인센티브</span><span style={{fontFamily:"monospace",fontWeight:700}}>+{fmt(Math.round(cost.should*q.inc/100))}</span></div>
          </div>
        </div>
      </div>
    </div>
  </div>);
}

// ═══ T4: Gap & Contract ═══
function T4({F,ac,mech,asp}){
  const all=F.map(f=>calc(f,mech,ac[f.id]||"sw",asp));
  const[qt,sQt]=useState(()=>all.map(c=>Math.round(c.should*(0.85+Math.random()*0.45))));
  const[locked,sLocked]=useState({});
  return(<div>
    <Guide title="Gap 분석 & 계약 기준선 가이드라인" step="4">
      <div><strong style={{color:C.navy}}>공급사 견적은 반드시 상세 항목으로 수령해야 합니다.</strong> 총액만 받으면 Cost Book이 작동하지 않습니다.</div>
      <div style={{marginTop:6}}><strong>필수 수령 항목:</strong> Feature ID, 개발공수, 검증공수, 통합공수, PM공수, Safety/Cyber/OTA 공수, 단가, 직접비, 도구비, 리스크비, 전제조건, 제외범위</div>
      <div style={{marginTop:8}}><strong>Gap 판정 기준:</strong></div>
      <div>· <strong style={{color:C.red}}>과다 ({">"} +20%):</strong> 공수 상세 WBS 재요청. 공수 부풀림 여부 확인</div>
      <div>· <strong style={{color:C.amber}}>확인 (+5~20%):</strong> 개발유형 계수, 복잡도 판정 재확인</div>
      <div>· <strong style={{color:C.green}}>적정 (±5%):</strong> 계약 기준선 확정 가능</div>
      <div>· <strong style={{color:C.amber}}>주의 (-5~-15%):</strong> 검증비, Safety/Cyber 증적비 누락 의심</div>
      <div>· <strong style={{color:C.red}}>과소 ({"<"} -15%):</strong> 검증/증적/통합비 누락 가능성 높음. 과소견적은 양산 리스크</div>
      <div style={{marginTop:8,padding:8,background:C.navy+"08",borderRadius:4}}>
        <strong style={{color:C.navy}}>계약 기준선 확정:</strong> Gap 분석 후 협상을 거쳐 합의된 금액을 "확정" 버튼으로 Lock합니다. 확정 후 모든 변경은 CR(변경비) 탭에서 관리합니다. 기준선은 분기별 Cost Book 보정 회의에서 재검토합니다.
      </div>
    </Guide>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
      <thead><tr style={{background:C.g05}}>{["Feature","Should-Cost","공급사(만)","Gap","Gap%","판정","기준선"].map(h=><th key={h} style={{padding:"7px 4px",textAlign:h==="Feature"?"left":"right",color:C.g5,fontWeight:600,borderBottom:`2px solid ${C.g1}`,fontSize:10}}>{h}</th>)}</tr></thead>
      <tbody>{F.map((f,i)=>{const s=all[i].should,q=qt[i]||0,gap=q-s,gp=s>0?((gap/s)*100).toFixed(1):0;
        const vd=gp>20?"과다":gp>5?"확인":gp<-15?"과소":gp<-5?"주의":"적정";const vc=vd==="과다"||vd==="과소"?C.red:vd==="확인"||vd==="주의"?C.amber:C.green;const isL=locked[f.id];
        return(<tr key={f.id} style={{borderBottom:`1px solid ${C.g05}`,background:isL?C.green+"08":C.w}}>
          <td style={{padding:"6px 4px"}}><span style={{fontFamily:"monospace",fontWeight:600,color:C.navy}}>{f.id}</span> {f.name}</td>
          <td style={{padding:"6px 4px",textAlign:"right",fontFamily:"monospace",fontWeight:600}}>{fmt(s)}</td>
          <td style={{padding:"6px 4px",textAlign:"right"}}><input type="number" value={q} onChange={e=>{if(!isL){const n=[...qt];n[i]=Number(e.target.value);sQt(n);}}} disabled={isL} style={{width:68,padding:"2px 4px",border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11,textAlign:"right",fontFamily:"monospace",opacity:isL?0.6:1}}/></td>
          <td style={{padding:"6px 4px",textAlign:"right",fontFamily:"monospace",fontWeight:600,color:gap>0?C.red:C.blue}}>{gap>0?"+":""}{fmt(gap)}</td>
          <td style={{padding:"6px 4px",textAlign:"right",fontFamily:"monospace"}}>{gp}%</td>
          <td style={{padding:"6px 4px",textAlign:"right"}}><Badge color={vc}>{vd}</Badge></td>
          <td style={{padding:"6px 4px",textAlign:"right"}}><button onClick={()=>{const n={...locked};n[f.id]=!isL;sLocked(n);}} style={{padding:"2px 8px",border:`1px solid ${isL?C.green:C.g1}`,borderRadius:3,background:isL?C.green+"15":C.w,fontSize:10,cursor:"pointer",color:isL?C.green:C.g5}}>{isL?"🔒 확정":"확정"}</button></td>
        </tr>);})}</tbody>
    </table></div>
  </div>);
}

// ═══ T5: CR ═══
function T5({F}){
  const[crs,sCrs]=useState([{fId:"FTR-001",desc:"FCW 감지 거리 60m→80m",impH:40,addH:120,reVH:80,docH:20,scH:30,dir:50}]);
  const addCr=()=>sCrs([...crs,{fId:F[0]?.id,desc:"새 CR",impH:20,addH:60,reVH:40,docH:10,scH:0,dir:0}]);
  const updCr=(i,k,v)=>{const n=[...crs];n[i]={...n[i],[k]:typeof crs[i][k]==="number"?Number(v):v};sCrs(n);};
  return(<div>
    <Guide title="CR 변경비 산정 가이드라인" step="5">
      <div><strong style={{color:C.navy}}>CR도 동일 공식으로 산정합니다.</strong> 별도 협상이 아닌, Cost Book의 표준 공식을 적용합니다.</div>
      <div style={{marginTop:6}}><strong>CR 비용 = (영향분석 + 추가개발 + 재검증 + 문서수정 + Safety/Cyber 재검토) × 단가 + 직접비</strong></div>
      <div style={{marginTop:8}}><strong>CR 발생 시 반드시 확인할 5가지 질문:</strong></div>
      <div>1. 변경이 요구사항만 바꾸는가, 인터페이스도 바꾸는가?</div>
      <div>2. Variant 조합 검증이 다시 필요한가?</div>
      <div>3. Safety 증적(FMEA, FTA, Safety Case) 재작성 대상인가?</div>
      <div>4. Cyber 증적(TARA) 재작성 대상인가?</div>
      <div>5. 회귀시험 범위는 어디까지인가? (Smoke / Regression / Full)</div>
      <div style={{marginTop:6}}><strong>각 공수 항목 설명:</strong></div>
      <div>· <strong>영향분석:</strong> 변경 범위 파악, 영향받는 컴포넌트/인터페이스 식별</div>
      <div>· <strong>추가개발:</strong> 실제 코드 수정, 설계 변경</div>
      <div>· <strong>재검증:</strong> 변경된 부분 + 영향받는 부분의 회귀시험</div>
      <div>· <strong>문서수정:</strong> 요구사항, 설계서, 시험계획서 등 Trace 업데이트</div>
      <div>· <strong>Safety/Cyber:</strong> ASIL/Cyber 해당 Feature의 경우 증적 재작성</div>
    </Guide>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
      <div style={{fontSize:14,fontWeight:700,color:C.navy}}>CR 변경비</div>
      <button onClick={addCr} style={{padding:"6px 12px",background:C.navy,color:C.w,border:"none",borderRadius:5,fontSize:11,cursor:"pointer"}}>+ CR</button>
    </div>
    {crs.map((cr,i)=>{const dom=DOMAINS[F.find(f=>f.id===cr.fId)?.domain||"BODY"];const tH=cr.impH+cr.addH+cr.reVH+cr.docH+cr.scH;const crC=Math.round(tH*dom.rate)+cr.dir;
      return(<div key={i} style={{border:`1px solid ${C.g1}`,borderRadius:8,padding:10,marginBottom:8}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 2fr",gap:6,marginBottom:6}}>
          <div><div style={{fontSize:10,color:C.g5}}>Feature</div><Sel value={cr.fId} onChange={v=>updCr(i,"fId",v)} opts={F.map(f=>[f.id,`${f.id} ${f.name}`])}/></div>
          <div><div style={{fontSize:10,color:C.g5}}>변경 설명</div><input value={cr.desc} onChange={e=>updCr(i,"desc",e.target.value)} style={{width:"100%",padding:4,border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11}}/></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,fontSize:10}}>
          {[{l:"영향분석(h)",k:"impH"},{l:"추가개발(h)",k:"addH"},{l:"재검증(h)",k:"reVH"},{l:"문서수정(h)",k:"docH"},{l:"Safety/Cyber(h)",k:"scH"},{l:"직접비(만)",k:"dir"}].map(x=>(<div key={x.k}><div style={{color:C.g5,marginBottom:2}}>{x.l}</div><input type="number" value={cr[x.k]} onChange={e=>updCr(i,x.k,e.target.value)} style={{width:"100%",padding:3,border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11,fontFamily:"monospace"}}/></div>))}
        </div>
        <div style={{marginTop:6,display:"flex",justifyContent:"flex-end"}}><span style={{fontSize:14,fontWeight:700,color:C.navy}}>CR 비용: {fmt(crC)}</span></div>
      </div>);
    })}
  </div>);
}

// ═══ T6: Evidence Gate ═══
function T6({F}){
  const[gD,sGD]=useState(()=>F.map(()=>GATES.reduce((o,g)=>({...o,[g]:Math.random()>0.3}),{})));
  const toggle=(fi,gate)=>{const n=[...gD];n[fi]={...n[fi],[gate]:!n[fi][gate]};sGD(n);};
  return(<div>
    <Guide title="증적 Gate 기반 비용 인정 가이드라인" step="6">
      <div><strong style={{color:C.navy}}>산출물이 없는데 비용을 인정하면 안 됩니다.</strong> 비용 인정은 증적 완료율에 연동합니다.</div>
      <div style={{marginTop:6}}><strong>비용 인정 기준:</strong></div>
      <div>· <strong style={{color:C.green}}>≥90% → 비용 인정 가능</strong></div>
      <div>· <strong style={{color:C.amber}}>60~89% → 조건부 인정</strong> (미완료 Gate 완료 계획 제출 필요)</div>
      <div>· <strong style={{color:C.red}}>{"<"}60% → 인정 보류</strong> (비용 지급 중단, 개선 계획 요구)</div>
      <div style={{marginTop:8}}><strong>각 Gate별 필요 증적:</strong></div>
      <div>· <strong>Requirement:</strong> 요구사항 명세서, 수용기준 (Codebeamer/DOORS)</div>
      <div>· <strong>Design:</strong> SW 설계서, 인터페이스 정의서 (EA/SysML)</div>
      <div>· <strong>Code Review:</strong> 코드리뷰 기록, 정적분석 결과</div>
      <div>· <strong>Unit Test:</strong> 단위시험 결과, 커버리지 리포트</div>
      <div>· <strong>Integration:</strong> 통합시험 결과 (SIL/HIL)</div>
      <div>· <strong>Safety:</strong> Safety Analysis(FMEA/FTA), Safety Case</div>
      <div>· <strong>Cyber:</strong> TARA, 보안검증, 취약점 대응</div>
      <div>· <strong>OTA:</strong> 패키징, 서명, rollback 검증</div>
      <div>· <strong>Validation:</strong> 실차 검증 결과</div>
      <div>· <strong>Release:</strong> 릴리스 승인, 잔여이슈 목록</div>
    </Guide>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:10}}>
      <thead><tr style={{background:C.g05}}>
        <th style={{padding:"6px 4px",textAlign:"left",color:C.g5,fontWeight:600,borderBottom:`1px solid ${C.g1}`}}>Feature</th>
        {GATES.map(g=><th key={g} style={{padding:"6px 1px",textAlign:"center",color:C.g5,fontWeight:600,borderBottom:`1px solid ${C.g1}`,fontSize:8}}>{g}</th>)}
        <th style={{padding:"6px 4px",textAlign:"right",color:C.g5,fontWeight:600,borderBottom:`1px solid ${C.g1}`}}>완료율</th>
        <th style={{padding:"6px 4px",textAlign:"right",color:C.g5,fontWeight:600,borderBottom:`1px solid ${C.g1}`}}>판정</th>
      </tr></thead>
      <tbody>{F.map((f,fi)=>{const gd=gD[fi]||{};const done=GATES.filter(g=>gd[g]).length;const pct=Math.round((done/GATES.length)*100);const vc=pct>=90?C.green:pct>=60?C.amber:C.red;const vl=pct>=90?"인정":pct>=60?"조건부":"보류";
        return(<tr key={f.id} style={{borderBottom:`1px solid ${C.g05}`}}>
          <td style={{padding:"4px",fontFamily:"monospace",fontWeight:600,color:C.navy}}>{f.id}</td>
          {GATES.map(g=>(<td key={g} style={{padding:"1px",textAlign:"center"}}><button onClick={()=>toggle(fi,g)} style={{width:16,height:16,borderRadius:3,border:`1px solid ${gd[g]?C.green:C.g1}`,background:gd[g]?C.green+"20":C.w,cursor:"pointer",fontSize:9,color:gd[g]?C.green:C.g3}}>{gd[g]?"✓":"·"}</button></td>))}
          <td style={{padding:"4px",textAlign:"right",fontFamily:"monospace",fontWeight:600,color:vc}}>{pct}%</td>
          <td style={{padding:"4px",textAlign:"right"}}><Badge color={vc}>{vl}</Badge></td>
        </tr>);})}</tbody>
    </table></div>
  </div>);
}

// ═══ T7: Actuals ═══
function T7({F,ac,mech,asp}){
  const all=F.map(f=>calc(f,mech,ac[f.id]||"sw",asp));
  const[act,sAct]=useState(()=>F.map((_,i)=>({dH:Math.round(all[i].devH*(0.8+Math.random()*0.5)),vH:Math.round(all[i].vH*(0.7+Math.random()*0.6)),def:Math.floor(Math.random()*12),rew:Math.floor(Math.random()*60)})));
  const upd=(i,k,v)=>{const n=[...act];n[i]={...n[i],[k]:Number(v)};sAct(n);};
  const avgD=F.reduce((s,_,i)=>s+(act[i].dH-all[i].devH)/all[i].devH,0)/F.length;
  const avgV=F.reduce((s,_,i)=>s+(act[i].vH-all[i].vH)/all[i].vH,0)/F.length;
  return(<div>
    <Guide title="실적 피드백 & 보정 가이드라인" step="7">
      <div><strong style={{color:C.navy}}>Cost Book의 정확도는 최초 기준값이 아니라, 실제 프로젝트 실적을 얼마나 체계적으로 반영하느냐에 의해 결정됩니다.</strong></div>
      <div style={{marginTop:6}}><strong>입력해야 할 실적 데이터:</strong></div>
      <div>· 실제 개발공수 (h), 실제 검증공수 (h), 결함 수, 재작업 공수 (h)</div>
      <div>· 추가 권장: CR 발생 횟수, 검증 반복 횟수, 증적 완료율, 공급사 납기 준수율</div>
      <div style={{marginTop:6}}><strong>보정 공식 (COCOMO II Calibration 방법론):</strong></div>
      <div>· 도메인별 실제 생산성 = 실제 총공수 / 실제 기능규모</div>
      <div>· 실제 검증비율 = 실제 검증공수 / 실제 개발공수</div>
      <div>· 공급사 생산성 지수 = 공급사 실제공수 / 기준공수</div>
      <div style={{marginTop:8}}><strong>기준값 상태 승격:</strong></div>
      <div>· <strong style={{color:C.red}}>Seed:</strong> 초기값, 계약 사용 불가 → 현재 상태</div>
      <div>· <strong style={{color:C.blue}}>Calibrated:</strong> 20건 이상 실적 보정 완료 → 조건부 계약 가능</div>
      <div>· <strong style={{color:C.green}}>Approved:</strong> 구매/R&D/재무 3자 승인 → 계약 사용 가능</div>
      <div style={{marginTop:4}}>보정은 3개월 또는 프로젝트 종료 시점마다 갱신합니다.</div>
    </Guide>
    <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
      <thead><tr style={{background:C.g05}}>{["Feature","예상개발","실제","편차","예상검증","실제","편차","결함","재작업"].map(h=><th key={h} style={{padding:"6px 3px",textAlign:h==="Feature"?"left":"right",color:C.g5,fontWeight:600,borderBottom:`2px solid ${C.g1}`,fontSize:10}}>{h}</th>)}</tr></thead>
      <tbody>{F.map((f,i)=>{const c=all[i],a=act[i];const dd=((a.dH-c.devH)/c.devH*100).toFixed(0),vd=((a.vH-c.vH)/c.vH*100).toFixed(0);
        const inp=k=><input type="number" value={a[k]} onChange={e=>upd(i,k,e.target.value)} style={{width:48,padding:"2px 3px",border:`1px solid ${C.g1}`,borderRadius:3,fontSize:11,textAlign:"right",fontFamily:"monospace"}}/>;
        return(<tr key={f.id} style={{borderBottom:`1px solid ${C.g05}`}}>
          <td style={{padding:"5px 3px"}}><span style={{fontFamily:"monospace",fontWeight:600,color:C.navy}}>{f.id}</span></td>
          <td style={{padding:"5px 3px",textAlign:"right",fontFamily:"monospace"}}>{c.devH.toLocaleString()}</td><td style={{padding:"5px 3px",textAlign:"right"}}>{inp("dH")}</td>
          <td style={{padding:"5px 3px",textAlign:"right",fontFamily:"monospace",fontWeight:600,color:Math.abs(dd)>15?C.red:C.green}}>{dd>0?"+":""}{dd}%</td>
          <td style={{padding:"5px 3px",textAlign:"right",fontFamily:"monospace"}}>{c.vH.toLocaleString()}</td><td style={{padding:"5px 3px",textAlign:"right"}}>{inp("vH")}</td>
          <td style={{padding:"5px 3px",textAlign:"right",fontFamily:"monospace",fontWeight:600,color:Math.abs(vd)>15?C.red:C.green}}>{vd>0?"+":""}{vd}%</td>
          <td style={{padding:"5px 3px",textAlign:"right"}}>{inp("def")}</td><td style={{padding:"5px 3px",textAlign:"right"}}>{inp("rew")}</td>
        </tr>);})}</tbody>
    </table></div>
    <div style={{marginTop:8,padding:10,background:C.g0,borderRadius:6,fontSize:11}}>
      개발공수 편차: <strong style={{color:Math.abs(avgD)>0.1?C.red:C.green}}>{(avgD*100).toFixed(1)}%</strong> | 검증공수 편차: <strong style={{color:Math.abs(avgV)>0.1?C.red:C.green}}>{(avgV*100).toFixed(1)}%</strong>
      {(Math.abs(avgD)>0.1||Math.abs(avgV)>0.1)&&<span style={{color:C.amber}}> → 기준값 보정 권장</span>}
    </div>
  </div>);
}

// ═══ T8: Refs ═══
function T8(){return(<div>
  <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:8}}>기준값 참조 & 파이프라인</div>
  <div style={{background:C.navy+"08",borderRadius:8,padding:10,marginBottom:12}}>
    <div style={{fontSize:11,fontWeight:600,color:C.navy,marginBottom:4}}>12단계 파이프라인</div>
    <div style={{display:"flex",gap:3,flexWrap:"wrap",fontSize:9}}>
      {["①Feature등록","②ASPICE","③FSC안전메커니즘","④TSC HW/SW","⑤Should-Cost","⑥설계품질","⑦Gap분석","⑧계약기준선","⑨CR변경비","⑩증적Gate","⑪Actuals","⑫보정→RFQ"].map((t,i)=>(<span key={i} style={{background:C.w,border:`1px solid ${C.g1}`,borderRadius:4,padding:"2px 6px",color:C.navy,fontWeight:600}}>{t}</span>))}
    </div>
  </div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
    {Object.entries(REFS).map(([id,r])=>(<div key={id} style={{padding:5,background:C.g0,borderRadius:4,fontSize:10}}><strong style={{color:C.navy}}>{id}</strong> {r.s} — <span style={{color:C.g5}}>{r.d}</span></div>))}
  </div>
</div>);}

// ═══ T9: Dashboard ═══
function T9({F,ac,mech,asp}){
  const all=F.map(f=>calc(f,mech,ac[f.id]||"sw",asp));const tSC=all.reduce((s,c)=>s+c.should,0),tDev=all.reduce((s,c)=>s+c.devCost,0),tVer=all.reduce((s,c)=>s+c.vCost,0);
  const byD={};F.forEach((f,i)=>{if(!byD[f.domain])byD[f.domain]={cost:0,n:0};byD[f.domain].cost+=all[i].should;byD[f.domain].n++;});const mxD=Math.max(...Object.values(byD).map(d=>d.cost));
  return(<div>
    <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:8}}>대시보드</div>
    <div style={{background:`linear-gradient(135deg,${C.navy},#003399)`,borderRadius:10,padding:14,marginBottom:10,display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
      {[{l:"Should-Cost",v:fmt(tSC)},{l:"개발비",v:`${Math.round(tDev/tSC*100)}%`},{l:"검증비",v:`${Math.round(tVer/tSC*100)}%`},{l:"Feature",v:`${F.length}건`},{l:"ASPICE",v:ASP_L[asp].l}].map(it=>(<div key={it.l} style={{textAlign:"center",color:C.w}}><div style={{fontSize:9,opacity:0.6}}>{it.l}</div><div style={{fontSize:18,fontWeight:700,marginTop:2}}>{it.v}</div></div>))}
    </div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
      <div style={{background:C.g0,borderRadius:8,padding:10}}><div style={{fontSize:11,fontWeight:600,color:C.g7,marginBottom:6}}>도메인별</div>
        {Object.entries(byD).sort((a,b)=>b[1].cost-a[1].cost).map(([d,v])=>(<div key={d} style={{marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2}}><span style={{color:DOMAINS[d]?.color,fontWeight:600}}>{DOMAINS[d]?.n} ({v.n})</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmt(v.cost)}</span></div><Bar value={v.cost} max={mxD} color={DOMAINS[d]?.color} h={5}/></div>))}</div>
      <div style={{background:C.g0,borderRadius:8,padding:10}}><div style={{fontSize:11,fontWeight:600,color:C.g7,marginBottom:6}}>비용 구조</div>
        {[{l:"개발비",v:tDev,c:C.blue},{l:"직접비",v:all.reduce((s,c)=>s+c.dirCost,0),c:"#795548"},{l:"검증비",v:tVer,c:C.amber},{l:"통합",v:all.reduce((s,c)=>s+c.iCost,0),c:C.purple},{l:"도구",v:all.reduce((s,c)=>s+c.tCost,0),c:C.g5},{l:"리스크",v:all.reduce((s,c)=>s+c.rCost,0),c:C.red}].map(it=>(<div key={it.l} style={{marginBottom:4}}><div style={{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:1}}><span>{it.l}</span><span style={{fontFamily:"monospace",fontWeight:600}}>{fmt(it.v)} ({Math.round(it.v/tSC*100)}%)</span></div><Bar value={it.v} max={tSC} color={it.c} h={5}/></div>))}</div>
    </div>
  </div>);
}

// ═══ MAIN ═══
export default function App(){
  const[tab,sTab]=useState("feat");const[F,sF]=useState(INIT_F);
  const[ac,sAc]=useState(()=>{const m={};INIT_F.forEach(f=>m[f.id]="sw");return m;});
  const[mech,sMech]=useState("redundancy");const[asp,sAsp]=useState("L2");
  return(<div style={{fontFamily:"'Pretendard',-apple-system,sans-serif",background:C.w,minHeight:"100vh"}}>
    <div style={{background:C.navy,padding:"10px 14px 6px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:13,color:C.w}}>◆</span><span style={{fontSize:13,fontWeight:700,color:C.w}}>SW Cost Book AI</span><span style={{fontSize:8,color:"#ffffff40",letterSpacing:1}}>v6.1 GUIDED PIPELINE</span></div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:10,color:"#ffffffaa"}}>프로젝트 ASPICE:</span>
          {Object.entries(ASP_L).map(([k,v])=>(<button key={k} onClick={()=>sAsp(k)} style={{padding:"3px 10px",borderRadius:12,border:`1px solid ${asp===k?"#ffffff60":"#ffffff20"}`,background:asp===k?"#ffffff20":"transparent",color:C.w,fontSize:10,cursor:"pointer",fontWeight:asp===k?700:400}}>{v.l} ×{v.oh}</button>))}
        </div>
      </div>
    </div>
    <div style={{display:"flex",gap:0,borderBottom:`2px solid ${C.g1}`,padding:"0 4px",background:C.g0,overflowX:"auto"}}>
      {TABS.map(t=>(<button key={t.id} onClick={()=>sTab(t.id)} style={{padding:"7px 9px",border:"none",borderBottom:tab===t.id?`2px solid ${C.navy}`:"2px solid transparent",background:"transparent",color:tab===t.id?C.navy:C.g5,fontSize:11,fontWeight:tab===t.id?700:400,cursor:"pointer",marginBottom:-2,whiteSpace:"nowrap"}}>{t.l}</button>))}
    </div>
    <div style={{padding:14,maxWidth:1100,margin:"0 auto"}}>
      {tab==="feat"&&<T1 F={F} sF={sF}/>}
      {tab==="arch"&&<T2 F={F} ac={ac} sAc={sAc} mech={mech} sMech={sMech} asp={asp}/>}
      {tab==="qual"&&<T3 F={F} ac={ac} mech={mech} asp={asp}/>}
      {tab==="gap"&&<T4 F={F} ac={ac} mech={mech} asp={asp}/>}
      {tab==="cr"&&<T5 F={F}/>}
      {tab==="gate"&&<T6 F={F}/>}
      {tab==="act"&&<T7 F={F} ac={ac} mech={mech} asp={asp}/>}
      {tab==="ref"&&<T8/>}
      {tab==="dash"&&<T9 F={F} ac={ac} mech={mech} asp={asp}/>}
    </div>
  </div>);
}
