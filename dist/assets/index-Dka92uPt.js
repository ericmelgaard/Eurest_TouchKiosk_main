(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))r(n);new MutationObserver(n=>{for(const i of n)if(i.type==="childList")for(const s of i.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&r(s)}).observe(document,{childList:!0,subtree:!0});function o(n){const i={};return n.integrity&&(i.integrity=n.integrity),n.referrerPolicy&&(i.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?i.credentials="include":n.crossOrigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function r(n){if(n.ep)return;n.ep=!0;const i=o(n);fetch(n.href,i)}})();const x=[{key:"config_key",label:"Preset Name",type:"text",placeholder:"default"},{key:"store_key",label:"Store Key",type:"text",placeholder:"2174"},{key:"partner_api",label:"Partner API",type:"select",options:["webtrition","ims","trm","qu"]},{key:"brand",label:"Brand (SAP Code)",type:"text",placeholder:"31709"},{key:"establishment",label:"Establishment (Venue)",type:"text",placeholder:"21332"},{key:"company_key",label:"Company Key",type:"text",placeholder:""},{key:"concept_key",label:"Concept Key",type:"text",placeholder:""},{key:"store_id",label:"Store ID",type:"text",placeholder:""},{key:"display_id",label:"Display ID",type:"text",placeholder:""},{key:"display_name",label:"Display Name",type:"text",placeholder:""},{key:"daypart_id",label:"Daypart ID",type:"text",placeholder:""},{key:"daypart_name",label:"Daypart Name",type:"text",placeholder:""},{key:"asset_id",label:"Asset ID",type:"text",placeholder:""},{key:"asset_zone_id",label:"Asset Zone ID",type:"text",placeholder:""},{key:"zone_id",label:"Zone ID",type:"text",placeholder:""},{key:"date_to_request",label:"Date Override",type:"text",placeholder:"yyyy-mm-dd"}];let l={},b=!0;function h(){const e=document.createElement("style");e.id="dev-config-panel-styles",!document.getElementById("dev-config-panel-styles")&&(e.textContent=`
        .dev-config-toggle {
            position: fixed;
            top: 50%;
            left: 0;
            transform: translateY(-50%);
            z-index: 2147483646;
            width: 32px;
            height: 64px;
            background: #1a2332;
            border: none;
            border-radius: 0 8px 8px 0;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease, left 0.3s ease;
            padding: 0;
        }
        .dev-config-toggle:hover {
            background: #2a3850;
        }
        .dev-config-toggle svg {
            width: 16px;
            height: 16px;
            fill: #8fa3b8;
            transition: transform 0.3s ease;
        }
        .dev-config-toggle.collapsed svg {
            transform: rotate(180deg);
        }
        .dev-config-toggle.collapsed {
            left: 0;
        }

        .dev-config-panel {
            position: fixed;
            top: 0;
            left: 0;
            width: 360px;
            height: 100vh;
            background: #1a2332;
            color: #c8d6e5;
            font-family: 'Barlow Semi Condensed', 'Segoe UI', sans-serif;
            font-size: 13px;
            z-index: 2147483645;
            overflow-y: auto;
            transition: transform 0.3s ease;
            box-shadow: 4px 0 24px rgba(0,0,0,0.4);
            border-right: 1px solid #2a3850;
        }
        .dev-config-panel.closed {
            transform: translateX(-100%);
        }

        .dev-config-header {
            background: #141d2b;
            padding: 16px 20px;
            border-bottom: 1px solid #2a3850;
            position: sticky;
            top: 0;
            z-index: 10;
        }
        .dev-config-header h2 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 700;
            color: #fff;
            letter-spacing: 0.5px;
        }
        .dev-config-header p {
            margin: 0;
            font-size: 11px;
            color: #6b7f94;
        }

        .dev-config-section {
            padding: 16px 20px;
            border-bottom: 1px solid #1e2a3d;
        }
        .dev-config-section-title {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7f94;
            margin: 0 0 12px 0;
        }

        .dev-config-field {
            margin-bottom: 12px;
        }
        .dev-config-field:last-child {
            margin-bottom: 0;
        }
        .dev-config-field label {
            display: block;
            font-size: 11px;
            color: #8fa3b8;
            margin-bottom: 4px;
            font-weight: 500;
        }
        .dev-config-field input,
        .dev-config-field select {
            width: 100%;
            padding: 8px 10px;
            background: #0f1822;
            border: 1px solid #2a3850;
            border-radius: 4px;
            color: #c8d6e5;
            font-size: 13px;
            font-family: inherit;
            box-sizing: border-box;
            transition: border-color 0.2s ease, background 0.2s ease;
        }
        .dev-config-field input:focus,
        .dev-config-field select:focus {
            outline: none;
            border-color: #3b6e8f;
            background: #14202e;
        }
        .dev-config-field input::placeholder {
            color: #3d5066;
        }

        .dev-config-presets {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 12px;
        }
        .dev-config-preset-chip {
            padding: 4px 10px;
            background: #1e2a3d;
            border: 1px solid #2a3850;
            border-radius: 12px;
            font-size: 11px;
            color: #8fa3b8;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }
        .dev-config-preset-chip:hover {
            background: #243650;
            color: #c8d6e5;
        }
        .dev-config-preset-chip.active {
            background: #2a4a6b;
            border-color: #3b6e8f;
            color: #fff;
        }
        .dev-config-preset-chip .delete-preset {
            margin-left: 6px;
            color: #d65a5a;
            font-weight: bold;
        }
        .dev-config-preset-chip .delete-preset:hover {
            color: #ff6b6b;
        }

        .dev-config-actions {
            display: flex;
            gap: 8px;
            padding: 16px 20px;
            border-top: 1px solid #2a3850;
            position: sticky;
            bottom: 0;
            background: #1a2332;
        }
        .dev-config-btn {
            flex: 1;
            padding: 10px 16px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: inherit;
        }
        .dev-config-btn-primary {
            background: #2a6e3f;
            color: #fff;
        }
        .dev-config-btn-primary:hover {
            background: #358a52;
        }
        .dev-config-btn-secondary {
            background: #2a3850;
            color: #c8d6e5;
        }
        .dev-config-btn-secondary:hover {
            background: #36486a;
        }

        .dev-config-status {
            padding: 8px 20px 4px 20px;
            font-size: 11px;
            color: #6b7f94;
            min-height: 20px;
        }
        .dev-config-status.success { color: #4caf72; }
        .dev-config-status.error { color: #d65a5a; }
        .dev-config-status.loading { color: #6b9fd6; }

        .dev-config-supabase-warning {
            padding: 12px 20px;
            background: #2a1a1a;
            border-bottom: 1px solid #3a2a2a;
            font-size: 11px;
            color: #d6a0a0;
            line-height: 1.5;
        }

        @media (max-width: 768px) {
            .dev-config-panel {
                width: 100vw;
            }
        }
    `,document.head.appendChild(e))}function C(){return{config_key:"default",store_key:typeof Store_Key<"u"?Store_Key:"",partner_api:typeof Partner_API<"u"?Partner_API:"",brand:typeof Brand<"u"?Brand:"",establishment:typeof Establishment<"u"?Establishment:"",company_key:typeof Company_Key<"u"?Company_Key:"",concept_key:typeof Concept_Key<"u"?Concept_Key:"",store_id:typeof Store_ID<"u"?Store_ID:"",display_id:typeof Display_ID<"u"?Display_ID:"",display_name:typeof Display_Name<"u"?Display_Name:"",daypart_id:typeof Daypart_ID<"u"?Daypart_ID:"",daypart_name:typeof Daypart_Name<"u"?Daypart_Name:"",asset_id:typeof Asset_ID<"u"?Asset_ID:"",asset_zone_id:typeof Asset_Zone_ID<"u"?Asset_Zone_ID:"",zone_id:typeof Zone_ID<"u"?Zone_ID:"",date_to_request:typeof dateToRequest<"u"?dateToRequest:""}}function k(){h(),l={...C()};const t=document.createElement("div");t.className="dev-config-panel",t.id="dev-config-panel";const o=document.createElement("div");o.className="dev-config-header",o.innerHTML=`
        <h2>Dev Configuration</h2>
        <p>Edit values that would normally come from Content Forecaster or Digital Client.</p>
    `,t.appendChild(o);{const a=document.createElement("div");a.className="dev-config-supabase-warning",a.textContent="Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable preset saving across sessions. Values will still apply temporarily.",t.appendChild(a)}const r=document.createElement("div");r.className="dev-config-section",r.innerHTML=`
        <div class="dev-config-section-title">Saved Presets</div>
        <div class="dev-config-presets" id="dev-config-preset-list"></div>
    `,t.appendChild(r);const n=document.createElement("div");n.className="dev-config-section",x.forEach(a=>{const p=document.createElement("div");p.className="dev-config-field";const m=document.createElement("label");if(m.textContent=a.label,m.setAttribute("for",`dev-config-${a.key}`),p.appendChild(m),a.type==="select"){const d=document.createElement("select");d.id=`dev-config-${a.key}`,d.dataset.field=a.key;const f=document.createElement("option");f.value="",f.textContent="-- select --",d.appendChild(f),a.options.forEach(u=>{const v=document.createElement("option");v.value=u,v.textContent=u,d.appendChild(v)}),d.value=l[a.key]||"",d.addEventListener("change",u=>{l[a.key]=u.target.value}),p.appendChild(d)}else{const d=document.createElement("input");d.type="text",d.id=`dev-config-${a.key}`,d.dataset.field=a.key,d.placeholder=a.placeholder||"",d.value=l[a.key]||"",d.addEventListener("input",f=>{l[a.key]=f.target.value}),p.appendChild(d)}n.appendChild(p)}),t.appendChild(n);const i=document.createElement("div");i.className="dev-config-status",i.id="dev-config-status",t.appendChild(i);const s=document.createElement("div");s.className="dev-config-actions";const g=document.createElement("button");g.className="dev-config-btn dev-config-btn-primary",g.textContent="Apply & Reload",g.addEventListener("click",I),s.appendChild(g);const y=document.createElement("button");y.className="dev-config-btn dev-config-btn-secondary",y.textContent="Save Preset",y.addEventListener("click",E),s.appendChild(y),t.appendChild(s),document.body.appendChild(t);const c=document.createElement("button");c.className="dev-config-toggle",c.id="dev-config-toggle",c.innerHTML=`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
    `,c.addEventListener("click",D),document.body.appendChild(c),A()}function D(){b=!b;const e=document.getElementById("dev-config-panel"),t=document.getElementById("dev-config-toggle");b?(e.classList.remove("closed"),t.classList.remove("collapsed"),t.style.left="360px"):(e.classList.add("closed"),t.classList.add("collapsed"),t.style.left="0")}function _(e,t){const o=document.getElementById("dev-config-status");o&&(o.textContent=e,o.className="dev-config-status",t&&o.classList.add(t))}function A(){{_("Supabase not configured — presets saved locally only","");return}}function I(){const e={...l};try{e.store_key&&(Store_Key=e.store_key),e.partner_api&&(Partner_API=e.partner_api),e.brand&&(Brand=e.brand),e.establishment&&(Establishment=e.establishment),e.company_key!==void 0&&(Company_Key=e.company_key),e.concept_key!==void 0&&(Concept_Key=e.concept_key),e.store_id!==void 0&&(Store_ID=e.store_id),e.display_id!==void 0&&(Display_ID=e.display_id),e.display_name!==void 0&&(Display_Name=e.display_name),e.daypart_id!==void 0&&(Daypart_ID=e.daypart_id),e.daypart_name!==void 0&&(Daypart_Name=e.daypart_name),e.asset_id!==void 0&&(Asset_ID=e.asset_id),e.asset_zone_id!==void 0&&(Asset_Zone_ID=e.asset_zone_id),e.zone_id!==void 0&&(Zone_ID=e.zone_id),e.date_to_request!==void 0&&(dateToRequest=e.date_to_request),AssetConfiguration.SKey=e.store_key||AssetConfiguration.SKey,AssetConfiguration.Aid=e.asset_id||AssetConfiguration.Aid,AssetConfiguration.DISid=e.display_id||AssetConfiguration.DISid,AssetConfiguration.Display=e.display_name||AssetConfiguration.Display,AssetConfiguration.DAYid=e.daypart_id||AssetConfiguration.DAYid,AssetConfiguration.Daypart=e.daypart_name||AssetConfiguration.Daypart,AssetConfiguration.AZid=e.asset_zone_id||AssetConfiguration.AZid,AssetConfiguration.SId=e.store_id||AssetConfiguration.SId,AssetConfiguration.Zid=e.zone_id||AssetConfiguration.Zid}catch(o){console.error("Error applying config values:",o)}const t=(e.store_key||Store_Key)+"_store_context("+version+")";try{const o=JSON.parse(localStorage.getItem(t)||"{}");o.API=(e.partner_api||"").toLowerCase()||o.API,o.brand=(e.brand||"").toLowerCase()||o.brand,o.siteId=(e.establishment||"").toLowerCase()||o.siteId,o.indexedDB=typeof isUsingIndexedDB<"u"?isUsingIndexedDB:!0,localStorage.setItem(t,JSON.stringify(o))}catch(o){console.error("Error updating store context:",o)}_("Applied — reloading...","success"),setTimeout(()=>{window.location.reload()},500)}async function E(){{_("Cannot save — Supabase not configured","error");return}}function S(){typeof development>"u"||!development||typeof client<"u"&&client||k()}S();
