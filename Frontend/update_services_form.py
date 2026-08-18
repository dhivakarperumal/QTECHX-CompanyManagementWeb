import re

with open('src/Admin/Settings/AdminServicesSettingsPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add SectionCard component after StatusPill
section_card_def = """
const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-white/10">
      <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <h2 className="text-sm font-bold text-white tracking-wide">{title}</h2>
    </div>
    <div className="space-y-5">
      {children}
    </div>
  </div>
);

"""

if "const SectionCard =" not in content:
    content = content.replace("const AdminServicesSettingsPage = () => {", section_card_def + "const AdminServicesSettingsPage = () => {")

# 2. Add some missing icons to imports if needed
imports_match = re.search(r'import \{([\s\S]*?)\} from \'lucide-react\';', content)
if imports_match:
    imports = imports_match.group(1)
    new_icons = ["FileText", "Image", "Link", "Globe", "CheckSquare", "Settings2", "Clock", "List"]
    for icon in new_icons:
        if icon not in imports:
            imports += f", {icon}"
    content = content.replace(imports_match.group(1), imports)

# We will replace the entire form part.
new_form = """<form onSubmit={handleSubmit} className="space-y-6 pb-10">
              <SectionCard icon={Settings2} title="General Information">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Service Code</label>
                    <input value={draft.service_code} onChange={(e) => updateField('service_code', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="WEB-001" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Display Order</label>
                    <input type="number" min="1" value={draft.display_order} onChange={(e) => updateField('display_order', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Title</label>
                    <input value={draft.title} onChange={(e) => updateField('title', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Application Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Category</label>
                    <input value={draft.category} onChange={(e) => updateField('category', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Subcategory</label>
                    <input value={draft.subcategory} onChange={(e) => updateField('subcategory', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Web Application Development" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Status</label>
                    <select value={draft.status} onChange={(e) => updateField('status', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex h-[46px] w-full cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-[#0a0b10] px-4 text-sm text-white hover:bg-white/5 transition-all shadow-inner">
                      <input type="checkbox" checked={Boolean(draft.featured)} onChange={(e) => updateField('featured', e.target.checked)} className="h-4 w-4 rounded border-white/20 bg-[#0a0b10] text-primary focus:ring-primary focus:ring-offset-0" />
                      Mark as featured service
                    </label>
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={FileText} title="Overview Content">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Tagline</label>
                    <input value={draft.tagline} onChange={(e) => updateField('tagline', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Custom, Scalable..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Description</label>
                    <textarea value={draft.description} onChange={(e) => updateField('description', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Detailed Description</label>
                    <textarea value={draft.detailed_description} onChange={(e) => updateField('detailed_description', e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={Image} title="Media & Files">
                <div>
                  <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Service Images</label>
                  <div className="space-y-4">
                    <div className="relative flex items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl bg-[#0a0b10] hover:bg-white/[0.02] hover:border-primary/50 transition-all cursor-pointer">
                      <input type="file" multiple accept="image/*" onChange={(e) => { if (e.target.files?.length) setDraft((prev) => ({ ...prev, singlepageImageFiles: Array.from(e.target.files) })); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      <div className="text-center">
                        <Upload size={24} className="mx-auto text-white/30 mb-2" />
                        <p className="text-sm text-white/50">Click or drag images to upload</p>
                      </div>
                    </div>
                    {draft.singlepageImageFiles?.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        {draft.singlepageImageFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
                            <span className="text-xs text-primary truncate pr-4">✓ {file.name}</span>
                            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, singlepageImageFiles: prev.singlepageImageFiles.filter((_, i) => i !== idx) }))} className="text-xs text-primary hover:text-red-400">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={List} title="Service Details">
                <div className="grid gap-6 md:grid-cols-2">
                  {[
                    { key: 'what_we_offer', label: 'What We Offer', placeholder: 'Custom Web App...' },
                    { key: 'key_features', label: 'Key Features', placeholder: 'Real-time dashboard...' },
                    { key: 'technologies_we_use', label: 'Technologies', placeholder: 'React, Node.js...' },
                    { key: 'service_process', label: 'Service Process', placeholder: 'Requirement Analysis...' },
                    { key: 'industries', label: 'Industries', placeholder: 'Healthcare...' },
                    { key: 'project_type', label: 'Project Types', placeholder: 'Enterprise App...' }
                  ].map((group) => (
                    <div key={group.key} className="bg-[#0a0b10]/50 p-4 rounded-xl border border-white/5 shadow-inner">
                      <div className="mb-4 flex items-center justify-between">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-white/40">{group.label}</label>
                        <button type="button" onClick={() => addArrayEntry(group.key, '')} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2 py-1.5 text-[10px] font-bold text-white hover:bg-primary hover:text-white transition-all">
                          <Plus size={12} /> ADD
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(Array.isArray(draft[group.key]) ? draft[group.key] : []).map((item, idx) => (
                          <div key={idx} className="flex gap-2">
                            <input type="text" value={item} onChange={(e) => updateArrayEntry(group.key, idx, e.target.value)} className="flex-1 rounded-lg border border-white/10 bg-[#0a0b10] px-3 py-2 text-sm text-white outline-none focus:border-primary/50 transition-all shadow-inner" placeholder={group.placeholder} />
                            <button type="button" onClick={() => removeArrayEntry(group.key, idx)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
                          </div>
                        ))}
                        {(!draft[group.key] || draft[group.key].length === 0) && (
                          <p className="text-[11px] text-white/20 italic text-center py-3">No entries added.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard icon={Clock} title="Pricing & Duration">
                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Starting Price</label>
                    <input type="number" min="0" value={draft.pricing?.starting_price ?? 0} onChange={(e) => updateNestedObject('pricing', 'starting_price', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Currency</label>
                    <input value={draft.pricing?.currency || 'INR'} onChange={(e) => updateNestedObject('pricing', 'currency', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Pricing Type</label>
                    <input value={draft.pricing?.pricing_type || 'Starting From'} onChange={(e) => updateNestedObject('pricing', 'pricing_type', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Estimated Time</label>
                    <input value={draft.duration?.estimated_time || '4-8 Weeks'} onChange={(e) => updateNestedObject('duration', 'estimated_time', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Delivery Type</label>
                    <input value={draft.duration?.delivery_type || 'Project Based'} onChange={(e) => updateNestedObject('duration', 'delivery_type', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                </div>
              </SectionCard>

              <SectionCard icon={CheckSquare} title="Why Choose Us">
                <div className="mb-3 flex justify-end">
                  <button type="button" onClick={() => addObjectEntry('why_choose_us', `New Item ${Object.keys(draft.why_choose_us || {}).length + 1}`, '')} className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary transition-all">
                    <Plus size={14} /> ADD ITEM
                  </button>
                </div>
                <div className="space-y-4">
                  {Object.entries(draft.why_choose_us || {}).length === 0 ? (
                    <div className="rounded-xl border border-dashed border-white/10 bg-[#0a0b10] px-3 py-10 text-center text-sm text-white/30">
                      No advantages added yet.
                    </div>
                  ) : (
                    Object.entries(draft.why_choose_us || {}).map(([key, value]) => (
                      <div key={key} className="rounded-xl border border-white/5 bg-[#0a0b10] p-4 flex flex-col gap-3 shadow-inner">
                        <div className="flex gap-3">
                          <input type="text" value={key} onChange={(e) => updateObjectEntryKey('why_choose_us', key, e.target.value || 'New Item')} className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white outline-none focus:border-primary/50 transition-all" placeholder="Advantage Title" />
                          <button type="button" onClick={() => removeObjectEntry('why_choose_us', key)} className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-red-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
                        </div>
                        <textarea value={value || ''} onChange={(e) => updateObjectEntryValue('why_choose_us', key, e.target.value)} rows={2} className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-primary/50 transition-all" placeholder="Explanation of why this matters..." />
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard icon={Globe} title="SEO Settings">
                <div className="space-y-5">
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Title</label>
                    <input value={draft.seo?.meta_title || ''} onChange={(e) => updateNestedObject('seo', 'meta_title', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="Optimize for search engines..." />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Description</label>
                    <textarea value={draft.seo?.meta_description || ''} onChange={(e) => updateNestedObject('seo', 'meta_description', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">Meta Keywords (Comma Separated)</label>
                    <textarea value={formatCommaList(draft.seo?.meta_keywords)} onChange={(e) => updateNestedObject('seo', 'meta_keywords', e.target.value)} rows={2} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" />
                  </div>
                  <div>
                    <label className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-white/40">URL Slug</label>
                    <input value={draft.seo?.slug || ''} onChange={(e) => updateNestedObject('seo', 'slug', e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#0a0b10] px-4 py-3 text-sm text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all shadow-inner" placeholder="e.g. web-development-services" />
                  </div>
                </div>
              </SectionCard>

              <div className="sticky bottom-0 -mx-6 -mb-6 mt-8 border-t border-white/10 bg-[#12141c]/90 p-6 backdrop-blur-md z-10">
                <button type="submit" className="w-full rounded-xl px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 flex items-center justify-center gap-2 shadow-xl shadow-primary/20" style={{ background: "linear-gradient(135deg,#f97316,#ea580c)" }}>
                  <Save size={18} /> Save Service Details
                </button>
              </div>
            </form>"""

form_pattern = re.compile(r'<form onSubmit=\{handleSubmit\} className="space-y-6 pb-10">.*?</form>', re.DOTALL)
content = form_pattern.sub(new_form, content)

with open('src/Admin/Settings/AdminServicesSettingsPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
