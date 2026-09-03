import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
}

const FIELDS = [
    { key: 'config_key', label: 'Preset Name', type: 'text', placeholder: 'default' },
    { key: 'store_key', label: 'Store Key', type: 'text', placeholder: '2174' },
    { key: 'partner_api', label: 'Partner API', type: 'select', options: ['webtrition', 'ims', 'trm', 'qu'] },
    { key: 'brand', label: 'Brand (SAP Code)', type: 'text', placeholder: '31709' },
    { key: 'establishment', label: 'Establishment (Venue)', type: 'text', placeholder: '21332' },
    { key: 'company_key', label: 'Company Key', type: 'text', placeholder: '' },
    { key: 'concept_key', label: 'Concept Key', type: 'text', placeholder: '' },
    { key: 'store_id', label: 'Store ID', type: 'text', placeholder: '' },
    { key: 'display_id', label: 'Display ID', type: 'text', placeholder: '' },
    { key: 'display_name', label: 'Display Name', type: 'text', placeholder: '' },
    { key: 'daypart_id', label: 'Daypart ID', type: 'text', placeholder: '' },
    { key: 'daypart_name', label: 'Daypart Name', type: 'text', placeholder: '' },
    { key: 'asset_id', label: 'Asset ID', type: 'text', placeholder: '' },
    { key: 'asset_zone_id', label: 'Asset Zone ID', type: 'text', placeholder: '' },
    { key: 'zone_id', label: 'Zone ID', type: 'text', placeholder: '' },
    { key: 'date_to_request', label: 'Date Override', type: 'text', placeholder: 'yyyy-mm-dd' },
];

let presets = [];
let currentValues = {};
let panelOpen = true;
let onApplyCallback = null;

function injectStyles() {
    const style = document.createElement('style');
    style.id = 'dev-config-panel-styles';
    if (document.getElementById('dev-config-panel-styles')) return;

    style.textContent = `
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
    `;
    document.head.appendChild(style);
}

function getCurrentDefaults() {
    return {
        config_key: 'default',
        store_key: typeof Store_Key !== 'undefined' ? Store_Key : '',
        partner_api: typeof Partner_API !== 'undefined' ? Partner_API : '',
        brand: typeof Brand !== 'undefined' ? Brand : '',
        establishment: typeof Establishment !== 'undefined' ? Establishment : '',
        company_key: typeof Company_Key !== 'undefined' ? Company_Key : '',
        concept_key: typeof Concept_Key !== 'undefined' ? Concept_Key : '',
        store_id: typeof Store_ID !== 'undefined' ? Store_ID : '',
        display_id: typeof Display_ID !== 'undefined' ? Display_ID : '',
        display_name: typeof Display_Name !== 'undefined' ? Display_Name : '',
        daypart_id: typeof Daypart_ID !== 'undefined' ? Daypart_ID : '',
        daypart_name: typeof Daypart_Name !== 'undefined' ? Daypart_Name : '',
        asset_id: typeof Asset_ID !== 'undefined' ? Asset_ID : '',
        asset_zone_id: typeof Asset_Zone_ID !== 'undefined' ? Asset_Zone_ID : '',
        zone_id: typeof Zone_ID !== 'undefined' ? Zone_ID : '',
        date_to_request: typeof dateToRequest !== 'undefined' ? dateToRequest : '',
    };
}

function buildPanel() {
    injectStyles();

    const defaults = getCurrentDefaults();
    currentValues = { ...defaults };

    const panel = document.createElement('div');
    panel.className = 'dev-config-panel';
    panel.id = 'dev-config-panel';

    const header = document.createElement('div');
    header.className = 'dev-config-header';
    header.innerHTML = `
        <h2>Dev Configuration</h2>
        <p>Edit values that would normally come from Content Forecaster or Digital Client.</p>
    `;
    panel.appendChild(header);

    if (!supabase) {
        const warning = document.createElement('div');
        warning.className = 'dev-config-supabase-warning';
        warning.textContent = 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env to enable preset saving across sessions. Values will still apply temporarily.';
        panel.appendChild(warning);
    }

    const presetsSection = document.createElement('div');
    presetsSection.className = 'dev-config-section';
    presetsSection.innerHTML = `
        <div class="dev-config-section-title">Saved Presets</div>
        <div class="dev-config-presets" id="dev-config-preset-list"></div>
    `;
    panel.appendChild(presetsSection);

    const fieldsSection = document.createElement('div');
    fieldsSection.className = 'dev-config-section';

    FIELDS.forEach(field => {
        const fieldDiv = document.createElement('div');
        fieldDiv.className = 'dev-config-field';

        const label = document.createElement('label');
        label.textContent = field.label;
        label.setAttribute('for', `dev-config-${field.key}`);
        fieldDiv.appendChild(label);

        if (field.type === 'select') {
            const select = document.createElement('select');
            select.id = `dev-config-${field.key}`;
            select.dataset.field = field.key;
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = '-- select --';
            select.appendChild(emptyOption);
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                select.appendChild(option);
            });
            select.value = currentValues[field.key] || '';
            select.addEventListener('change', (e) => {
                currentValues[field.key] = e.target.value;
            });
            fieldDiv.appendChild(select);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = `dev-config-${field.key}`;
            input.dataset.field = field.key;
            input.placeholder = field.placeholder || '';
            input.value = currentValues[field.key] || '';
            input.addEventListener('input', (e) => {
                currentValues[field.key] = e.target.value;
            });
            fieldDiv.appendChild(input);
        }

        fieldsSection.appendChild(fieldDiv);
    });

    panel.appendChild(fieldsSection);

    const statusDiv = document.createElement('div');
    statusDiv.className = 'dev-config-status';
    statusDiv.id = 'dev-config-status';
    panel.appendChild(statusDiv);

    const actions = document.createElement('div');
    actions.className = 'dev-config-actions';

    const applyBtn = document.createElement('button');
    applyBtn.className = 'dev-config-btn dev-config-btn-primary';
    applyBtn.textContent = 'Apply & Reload';
    applyBtn.addEventListener('click', applyConfig);
    actions.appendChild(applyBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'dev-config-btn dev-config-btn-secondary';
    saveBtn.textContent = 'Save Preset';
    saveBtn.addEventListener('click', savePreset);
    actions.appendChild(saveBtn);

    panel.appendChild(actions);

    document.body.appendChild(panel);

    const toggle = document.createElement('button');
    toggle.className = 'dev-config-toggle';
    toggle.id = 'dev-config-toggle';
    toggle.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
        </svg>
    `;
    toggle.addEventListener('click', togglePanel);
    document.body.appendChild(toggle);

    loadPresets();
}

function togglePanel() {
    panelOpen = !panelOpen;
    const panel = document.getElementById('dev-config-panel');
    const toggle = document.getElementById('dev-config-toggle');
    if (panelOpen) {
        panel.classList.remove('closed');
        toggle.classList.remove('collapsed');
        toggle.style.left = '360px';
    } else {
        panel.classList.add('closed');
        toggle.classList.add('collapsed');
        toggle.style.left = '0';
    }
}

function setStatus(message, type) {
    const status = document.getElementById('dev-config-status');
    if (!status) return;
    status.textContent = message;
    status.className = 'dev-config-status';
    if (type) status.classList.add(type);
}

function updateFieldInputs(values) {
    FIELDS.forEach(field => {
        const el = document.getElementById(`dev-config-${field.key}`);
        if (el) {
            el.value = values[field.key] || '';
        }
    });
}

function loadPresets() {
    if (!supabase) {
        setStatus('Supabase not configured — presets saved locally only', '');
        return;
    }
    setStatus('Loading presets...', 'loading');
    supabase
        .from('dev_configs')
        .select('*')
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
            if (error) {
                setStatus('Failed to load presets: ' + error.message, 'error');
                return;
            }
            presets = data || [];
            renderPresets();
            const active = presets.find(p => p.is_active);
            if (active) {
                applyPresetToFields(active);
                setStatus('Loaded active preset: ' + active.config_key, 'success');
            } else {
                setStatus('', '');
            }
        });
}

function renderPresets() {
    const list = document.getElementById('dev-config-preset-list');
    if (!list) return;
    list.innerHTML = '';

    presets.forEach(preset => {
        const chip = document.createElement('div');
        chip.className = 'dev-config-preset-chip';
        if (preset.is_active) chip.classList.add('active');
        chip.textContent = preset.config_key;

        const deleteSpan = document.createElement('span');
        deleteSpan.className = 'delete-preset';
        deleteSpan.textContent = ' x';
        deleteSpan.addEventListener('click', (e) => {
            e.stopPropagation();
            deletePreset(preset);
        });
        chip.appendChild(deleteSpan);

        chip.addEventListener('click', () => {
            applyPresetToFields(preset);
        });
        list.appendChild(chip);
    });
}

function applyPresetToFields(preset) {
    const values = {};
    FIELDS.forEach(field => {
        values[field.key] = preset[field.key] || '';
    });
    currentValues = { ...currentValues, ...values };
    updateFieldInputs(currentValues);
}

function applyConfig() {
    const vals = { ...currentValues };

    try {
        if (vals.store_key) { Store_Key = vals.store_key; }
        if (vals.partner_api) { Partner_API = vals.partner_api; }
        if (vals.brand) { Brand = vals.brand; }
        if (vals.establishment) { Establishment = vals.establishment; }
        if (vals.company_key !== undefined) { Company_Key = vals.company_key; }
        if (vals.concept_key !== undefined) { Concept_Key = vals.concept_key; }
        if (vals.store_id !== undefined) { Store_ID = vals.store_id; }
        if (vals.display_id !== undefined) { Display_ID = vals.display_id; }
        if (vals.display_name !== undefined) { Display_Name = vals.display_name; }
        if (vals.daypart_id !== undefined) { Daypart_ID = vals.daypart_id; }
        if (vals.daypart_name !== undefined) { Daypart_Name = vals.daypart_name; }
        if (vals.asset_id !== undefined) { Asset_ID = vals.asset_id; }
        if (vals.asset_zone_id !== undefined) { Asset_Zone_ID = vals.asset_zone_id; }
        if (vals.zone_id !== undefined) { Zone_ID = vals.zone_id; }
        if (vals.date_to_request !== undefined) { dateToRequest = vals.date_to_request; }

        AssetConfiguration.SKey = vals.store_key || AssetConfiguration.SKey;
        AssetConfiguration.Aid = vals.asset_id || AssetConfiguration.Aid;
        AssetConfiguration.DISid = vals.display_id || AssetConfiguration.DISid;
        AssetConfiguration.Display = vals.display_name || AssetConfiguration.Display;
        AssetConfiguration.DAYid = vals.daypart_id || AssetConfiguration.DAYid;
        AssetConfiguration.Daypart = vals.daypart_name || AssetConfiguration.Daypart;
        AssetConfiguration.AZid = vals.asset_zone_id || AssetConfiguration.AZid;
        AssetConfiguration.SId = vals.store_id || AssetConfiguration.SId;
        AssetConfiguration.Zid = vals.zone_id || AssetConfiguration.Zid;
    } catch (e) {
        console.error('Error applying config values:', e);
    }

    const storeContextKey = (vals.store_key || Store_Key) + "_store_context(" + version + ")";
    try {
        const existing = JSON.parse(localStorage.getItem(storeContextKey) || '{}');
        existing.API = (vals.partner_api || '').toLowerCase() || existing.API;
        existing.brand = (vals.brand || '').toLowerCase() || existing.brand;
        existing.siteId = (vals.establishment || '').toLowerCase() || existing.siteId;
        existing.indexedDB = typeof isUsingIndexedDB !== 'undefined' ? isUsingIndexedDB : true;
        localStorage.setItem(storeContextKey, JSON.stringify(existing));
    } catch (e) {
        console.error('Error updating store context:', e);
    }

    setStatus('Applied — reloading...', 'success');
    setTimeout(() => {
        window.location.reload();
    }, 500);
}

async function savePreset() {
    if (!supabase) {
        setStatus('Cannot save — Supabase not configured', 'error');
        return;
    }

    const presetName = currentValues.config_key || 'default';
    if (!presetName.trim()) {
        setStatus('Preset name is required', 'error');
        return;
    }

    setStatus('Saving preset...', 'loading');

    const rowData = {
        config_key: presetName,
        store_key: currentValues.store_key || '',
        partner_api: currentValues.partner_api || '',
        brand: currentValues.brand || '',
        establishment: currentValues.establishment || '',
        company_key: currentValues.company_key || '',
        concept_key: currentValues.concept_key || '',
        store_id: currentValues.store_id || '',
        display_id: currentValues.display_id || '',
        display_name: currentValues.display_name || '',
        daypart_id: currentValues.daypart_id || '',
        daypart_name: currentValues.daypart_name || '',
        asset_id: currentValues.asset_id || '',
        asset_zone_id: currentValues.asset_zone_id || '',
        zone_id: currentValues.zone_id || '',
        date_to_request: currentValues.date_to_request || '',
        updated_at: new Date().toISOString(),
    };

    const existing = presets.find(p => p.config_key === presetName);

    if (existing) {
        const { error } = await supabase
            .from('dev_configs')
            .update(rowData)
            .eq('id', existing.id);
        if (error) {
            setStatus('Failed to update: ' + error.message, 'error');
            return;
        }
        Object.assign(existing, rowData);
    } else {
        const { data, error } = await supabase
            .from('dev_configs')
            .insert(rowData)
            .select();
        if (error) {
            setStatus('Failed to save: ' + error.message, 'error');
            return;
        }
        if (data && data[0]) presets.push(data[0]);
    }

    renderPresets();
    setStatus('Preset "' + presetName + '" saved', 'success');
}

async function deletePreset(preset) {
    if (!supabase) return;
    if (!confirm('Delete preset "' + preset.config_key + '"?')) return;

    const { error } = await supabase
        .from('dev_configs')
        .delete()
        .eq('id', preset.id);
    if (error) {
        setStatus('Failed to delete: ' + error.message, 'error');
        return;
    }
    presets = presets.filter(p => p.id !== preset.id);
    renderPresets();
    setStatus('Preset deleted', 'success');
}

export function initDevConfigPanel() {
    if (typeof development === 'undefined' || !development) return;
    if (typeof client !== 'undefined' && client) return;
    buildPanel();
}
