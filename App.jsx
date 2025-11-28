const { useState, useRef } = React;

/**
 * Resume Builder — Aaditya Template (React, plain JSX)
 * v4 — Converted to .jsx for GitHub Pages/CDN use (no TypeScript, no modules).
 * - Keeps ATS Mode, tests, blue accent, contact row under name.
 * - Removes TS types/generics and the `export default` so <script type="text/babel"> works.
 */

function App() {
  const [data, setData] = useState(defaultData);
  const [atsMode, setAtsMode] = useState(false);
  const [tests, setTests] = useState(null);
  const printAreaRef = useRef(null);

  const onChange = (path, value) => setData(prev => setDeep(prev, path, value));

  const addItem = (path, template) =>
    setData(prev => ({ ...prev, [path]: [...(prev[path] || []), structuredClone(template)] }));

  const removeItem = (path, idx) =>
    setData(prev => ({ ...prev, [path]: (prev[path] || []).filter((_, i) => i !== idx) }));

  const moveItem = (path, idx, dir) =>
    setData(prev => {
      const arr = [...(prev[path] || [])];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return prev;
      [arr[idx], arr[j]] = [arr[j], arr[idx]];
      return { ...prev, [path]: arr };
    });

  const handlePrint = () => window.print();
  const handleRunTests = () => setTests(runBasicTests(data));

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900" style={{ ['--accent']: '#2B6CB0' }}>
      {/* App header */}
      <div className="sticky top-0 z-30 bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl text-white grid place-items-center text-sm font-semibold" style={{ backgroundColor: 'var(--accent)' }}>RB</div>
            <div>
              <div className="text-sm uppercase tracking-wide text-neutral-500">Resume Builder</div>
              <div className="text-base font-semibold">Aaditya Template</div>
            </div>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <label className="flex items-center gap-2 text-sm mr-2">
              <input type="checkbox" checked={atsMode} onChange={e => setAtsMode(e.target.checked)} />
              ATS Mode
            </label>
            <button onClick={handleRunTests} className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50">Run tests</button>
            <button onClick={() => setData(defaultData)} className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50">Load sample</button>
            <button onClick={() => setData(emptyData())} className="px-3 py-2 rounded-xl border text-sm hover:bg-neutral-50">Clear all</button>
            <button onClick={handlePrint} className="px-4 py-2 rounded-xl text-white text-sm font-medium" style={{ backgroundColor: 'var(--accent)' }}>Download PDF</button>
          </div>
        </div>
        {tests && (
          <div className="mx-auto max-w-7xl px-4 pb-3 print:hidden">
            <div className="mt-2 bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-sm">
              <div className="font-semibold mb-1">Test results</div>
              <ul className="list-disc pl-5 space-y-1">
                {tests.map((t, i) => (
                  <li key={i} className={t.pass ? 'text-green-700' : 'text-red-700'}>
                    {t.pass ? 'PASS' : 'FAIL'}: {t.name} {t.message ? `– ${t.message}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 px-4 py-6">
        {/* Left: Editor */}
        <div className="lg:col-span-4 print:hidden">
          <Editor data={data} onChange={onChange} addItem={addItem} removeItem={removeItem} moveItem={moveItem} />
        </div>

        {/* Right: Preview (A4) */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            <div className="p-2 bg-neutral-50 border-b text-xs text-neutral-600">Preview</div>
            <div className="p-6">
              <ResumeA4 data={data} atsMode={atsMode} ref={printAreaRef} />
            </div>
          </div>
        </div>
      </div>

      <PrintStyles />
    </div>
  );
}

// ========================= Editor ========================= //
function Editor({ data, onChange, addItem, removeItem, moveItem }) {
  return (
    <div className="space-y-6">
      <Panel title="Header">
        <Grid two>
          <Text label="Full name" value={data.header.name} onChange={v => onChange('header.name', v)} />
          <Text label="Headline" value={data.header.title} onChange={v => onChange('header.title', v)} />
        </Grid>
        <Grid two>
          <Text label="Phone" value={data.header.phone} onChange={v => onChange('header.phone', v)} />
          <Text label="Email" value={data.header.email} onChange={v => onChange('header.email', v)} />
        </Grid>
        <Grid two>
          <Text label="LinkedIn" value={data.header.linkedin} onChange={v => onChange('header.linkedin', v)} />
          <Text label="Location" value={data.header.location} onChange={v => onChange('header.location', v)} />
        </Grid>
      </Panel>

      <Panel title="Professional Summary">
        <Textarea value={data.summary} onChange={v => onChange('summary', v)} rows={5} />
      </Panel>

      <Panel title="Core Skills (grouped)">
        <Textarea value={data.coreSkills || ''} onChange={v => onChange('coreSkills', v)} rows={8} />
      </Panel>

      <Panel title="Experience">
        {data.experience.map((x, i) => (
          <div key={i} className="border rounded-xl p-3 mb-3">
            <Grid two>
              <Text label="Role" value={x.role} onChange={v => onChange(`experience.${i}.role`, v)} />
              <Text label="Company" value={x.company} onChange={v => onChange(`experience.${i}.company`, v)} />
            </Grid>
            <Grid two>
              <Text label="Dates" value={x.dates} onChange={v => onChange(`experience.${i}.dates`, v)} />
              <Text label="Location" value={x.location} onChange={v => onChange(`experience.${i}.location`, v)} />
            </Grid>
            <ListEditor label="Highlights" items={x.bullets} onChange={arr => onChange(`experience.${i}.bullets`, arr)} />
            <Row>
              <SmallBtn onClick={() => moveItem('experience', i, -1)}>↑</SmallBtn>
              <SmallBtn onClick={() => moveItem('experience', i, 1)}>↓</SmallBtn>
              <SmallBtn onClick={() => removeItem('experience', i)} danger>
                Remove
              </SmallBtn>
            </Row>
          </div>
        ))}
        <button className="mt-2 px-3 py-2 rounded-xl border text-sm" onClick={() => addItem('experience', blankExperience())}>
          Add role
        </button>
      </Panel>

      <Panel title="Education">
        {data.education.map((x, i) => (
          <div key={i} className="border rounded-xl p-3 mb-3">
            <Grid two>
              <Text label="Degree" value={x.degree} onChange={v => onChange(`education.${i}.degree`, v)} />
              <Text label="Institution" value={x.school} onChange={v => onChange(`education.${i}.school`, v)} />
            </Grid>
            <Grid two>
              <Text label="Dates" value={x.dates} onChange={v => onChange(`education.${i}.dates`, v)} />
              <Text label="Location" value={x.location} onChange={v => onChange(`education.${i}.location`, v)} />
            </Grid>
            <Row>
              <SmallBtn onClick={() => moveItem('education', i, -1)}>↑</SmallBtn>
              <SmallBtn onClick={() => moveItem('education', i, 1)}>↓</SmallBtn>
              <SmallBtn onClick={() => removeItem('education', i)} danger>
                Remove
              </SmallBtn>
            </Row>
          </div>
        ))}
        <button className="mt-2 px-3 py-2 rounded-xl border text-sm" onClick={() => addItem('education', blankEducation())}>
          Add education
        </button>
      </Panel>

      <Panel title="Projects">
        {data.projects.map((x, i) => (
          <div key={i} className="border rounded-xl p-3 mb-3">
            <Grid two>
              <Text label="Title" value={x.title} onChange={v => onChange(`projects.${i}.title`, v)} />
              <Text label="Dates" value={x.dates} onChange={v => onChange(`projects.${i}.dates`, v)} />
            </Grid>
            <Grid two>
              <Text label="Org" value={x.org} onChange={v => onChange(`projects.${i}.org`, v)} />
              <Text label="Location" value={x.location} onChange={v => onChange(`projects.${i}.location`, v)} />
            </Grid>
            <ListEditor label="Highlights" items={x.bullets} onChange={arr => onChange(`projects.${i}.bullets`, arr)} />
            <Row>
              <SmallBtn onClick={() => moveItem('projects', i, -1)}>↑</SmallBtn>
              <SmallBtn onClick={() => moveItem('projects', i, 1)}>↓</SmallBtn>
              <SmallBtn onClick={() => removeItem('projects', i)} danger>
                Remove
              </SmallBtn>
            </Row>
          </div>
        ))}
        <button className="mt-2 px-3 py-2 rounded-xl border text-sm" onClick={() => addItem('projects', blankProject())}>
          Add project
        </button>
      </Panel>

      <Panel title="Skills / Tools (tags)">
        <TagEditor items={data.skills} onChange={arr => onChange('skills', arr)} placeholder="e.g., Python" />
      </Panel>

      <Panel title="Publications">
        {data.publications.map((x, i) => (
          <div key={i} className="border rounded-xl p-3 mb-3">
            <Text label="Title" value={x.title} onChange={v => onChange(`publications.${i}.title`, v)} />
            <Grid two>
              <Text label="Venue" value={x.venue} onChange={v => onChange(`publications.${i}.venue`, v)} />
              <Text label="Date/DOI" value={x.meta} onChange={v => onChange(`publications.${i}.meta`, v)} />
            </Grid>
            <Textarea label="Summary" value={x.summary} onChange={v => onChange(`publications.${i}.summary`, v)} rows={3} />
            <Row>
              <SmallBtn onClick={() => moveItem('publications', i, -1)}>↑</SmallBtn>
              <SmallBtn onClick={() => moveItem('publications', i, 1)}>↓</SmallBtn>
              <SmallBtn onClick={() => removeItem('publications', i)} danger>
                Remove
              </SmallBtn>
            </Row>
          </div>
        ))}
        <button className="mt-2 px-3 py-2 rounded-xl border text-sm" onClick={() => addItem('publications', blankPublication())}>
          Add publication
        </button>
      </Panel>
    </div>
  );
}

// ========================= Preview (A4) ========================= //
const ResumeA4 = React.forwardRef(function ResumeA4({ data, atsMode }, ref) {
  const contactParts = [data.header.phone, data.header.email, data.header.linkedin, data.header.location].filter(Boolean);
  const sep = atsMode ? ' | ' : ' • ';
  return (
    <div ref={ref} className="resume-a4 mx-auto w-[210mm] bg-white text-[11pt] leading-[1.35]">
      <div className="p-[14mm]">
        {/* Header */}
        <header className="pb-3 border-b" style={{ borderColor: 'var(--accent)' }}>
          <h1 className="text-[20pt] font-extrabold tracking-tight">{data.header.name}</h1>
          <div className="text-neutral-800 font-medium">{data.header.title}</div>
          <div className="mt-1 text-[10pt] text-neutral-900 flex flex-wrap gap-x-3 gap-y-1">
            {contactParts.length > 0 && <span>{contactParts.join(sep)}</span>}
          </div>
        </header>

        {/* Body */}
        {!atsMode ? (
          <div className="grid grid-cols-10 gap-6 mt-5">
            {/* Left main column */}
            <main className="col-span-6">
              <Section title="SUMMARY">
                <p className="text-[10.5pt] text-neutral-800 whitespace-pre-line">{data.summary}</p>
              </Section>

              <Section title="EXPERIENCE">
                {data.experience.map((x, i) => (
                  <Entry key={i} role={x.role} company={x.company} dates={x.dates} location={x.location} bullets={x.bullets} />
                ))}
              </Section>

              <Section title="PROJECTS">
                {data.projects.map((x, i) => (
                  <Entry key={i} role={x.title} company={x.org} dates={x.dates} location={x.location} bullets={x.bullets} />
                ))}
              </Section>
            </main>

            {/* Right sidebar */}
            <aside className="col-span-4">
              {data.coreSkills && (
                <Section title="CORE SKILLS">
                  <div className="text-[10.5pt] whitespace-pre-line text-neutral-800">{data.coreSkills}</div>
                </Section>
              )}

              <Section title="EDUCATION">
                {data.education.map((x, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="font-semibold">{x.degree}</div>
                    <div className="text-[10pt]">{x.school}</div>
                    <div className="text-[9.5pt] text-neutral-600">{x.dates}{x.location ? `  ·  ${x.location}` : ''}</div>
                  </div>
                ))}
              </Section>

              <Section title="SKILLS / TOOLS">
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s, i) => (
                    <span key={i} className="text-[9.5pt] px-2 py-1 rounded-full border border-neutral-300">{s}</span>
                  ))}
                </div>
              </Section>

              {data.publications.length > 0 && (
                <Section title="PUBLICATIONS">
                  {data.publications.map((p, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-[10pt] text-neutral-700">{p.venue}</div>
                      <div className="text-[9.5pt] text-neutral-600">{p.meta}</div>
                      {p.summary && <div className="text-[9.5pt] text-neutral-700 mt-1">{p.summary}</div>}
                    </div>
                  ))}
                </Section>
              )}
            </aside>
          </div>
        ) : (
          // ATS single-column ordering
          <div className="mt-5">
            {data.coreSkills && (
              <Section title="CORE SKILLS">
                <div className="text-[10.5pt] whitespace-pre-line text-neutral-800">{data.coreSkills}</div>
              </Section>
            )}
            <Section title="SUMMARY">
              <p className="text-[10.5pt] text-neutral-800 whitespace-pre-line">{data.summary}</p>
            </Section>

            <Section title="EXPERIENCE">
              {data.experience.map((x, i) => (
                <Entry key={i} role={x.role} company={x.company} dates={x.dates} location={x.location} bullets={x.bullets} />
              ))}
            </Section>

            <Section title="EDUCATION">
              {data.education.map((x, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="font-semibold">{x.degree}</div>
                  <div className="text-[10pt]">{x.school}</div>
                  <div className="text-[9.5pt] text-neutral-600">{x.dates}{x.location ? `  ·  ${x.location}` : ''}</div>
                </div>
              ))}
            </Section>

            <Section title="PROJECTS">
              {data.projects.map((x, i) => (
                <Entry key={i} role={x.title} company={x.org} dates={x.dates} location={x.location} bullets={x.bullets} />
              ))}
            </Section>

            <Section title="SKILLS / TOOLS">
              <ul className="list-disc pl-5 text-[10.5pt] text-neutral-800">
                {data.skills.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Section>

            {data.publications.length > 0 && (
              <Section title="PUBLICATIONS">
                {data.publications.map((p, i) => (
                  <div key={i} className="mb-3 last:mb-0">
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-[10pt] text-neutral-700">{p.venue}</div>
                    <div className="text-[9.5pt] text-neutral-600">{p.meta}</div>
                    {p.summary && <div className="text-[9.5pt] text-neutral-700 mt-1">{p.summary}</div>}
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

function Section({ title, children }) {
  return (
    <section className="mb-4">
      <h2 className="text-[11pt] font-extrabold tracking-wider mb-1.5" style={{ color: 'var(--accent)' }}>{title}</h2>
      <div className="h-[2px] mb-2" style={{ backgroundColor: 'var(--accent)' }} />
      {children}
    </section>
  );
}

function Entry({ role, company, dates, location, bullets }) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-baseline justify-between gap-4">
        <div className="font-semibold">
          {role}{company ? `, ${company}` : ''}
        </div>
        <div className="text-[9.5pt] text-neutral-600 whitespace-nowrap">{dates}{location ? `  ·  ${location}` : ''}</div>
      </div>
      {bullets && bullets.length > 0 && (
        <ul className="mt-1 list-disc pl-5 space-y-0.5 text-[10.5pt] text-neutral-800">
          {bullets.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ========================= Small UI bits ========================= //
function Panel({ title, children }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
      <div className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-600 bg-neutral-50 border-b">{title}</div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Grid({ two = false, children }) {
  return <div className={two ? 'grid grid-cols-2 gap-3' : 'grid gap-3'}>{children}</div>;
}

function Row({ children }) {
  return <div className="flex items-center gap-2 mt-2">{children}</div>;
}

function Label({ children }) {
  return <div className="text-[11px] font-medium text-neutral-600 mb-1">{children}</div>;
}

function Text({ label, value, onChange }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <input value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
    </label>
  );
}

function Textarea({ label, value, onChange, rows = 4 }) {
  return (
    <label className="block">
      {label && <Label>{label}</Label>}
      <textarea rows={rows} value={value} onChange={e => onChange(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900/20" />
    </label>
  );
}

function SmallBtn({ children, onClick, danger }) {
  return (
    <button onClick={onClick} className={`px-2 py-1 rounded-lg text-xs border ${danger ? 'border-red-300 text-red-700 hover:bg-red-50' : 'border-neutral-300 text-neutral-800 hover:bg-neutral-50'}`}>
      {children}
    </button>
  );
}

function ListEditor({ label = 'Items', items, onChange }) {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={t} onChange={e => onChange(items.map((x, j) => (j === i ? e.target.value : x)))} className="flex-1 px-3 py-2 rounded-xl border border-neutral-300" />
            <SmallBtn onClick={() => onChange(items.filter((_, j) => j !== i))} danger>
              Remove
            </SmallBtn>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input placeholder="Add new" value={draft} onChange={e => setDraft(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-neutral-300" />
        <SmallBtn
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft('');
          }}
        >
          Add
        </SmallBtn>
      </div>
    </div>
  );
}

function TagEditor({ items, onChange, placeholder = 'Add skill' }) {
  const [draft, setDraft] = useState('');
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-1 px-2 py-1 rounded-full border border-neutral-300 text-sm">
            <span>{t}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-neutral-500 hover:text-neutral-800">×</button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input placeholder={placeholder} value={draft} onChange={e => setDraft(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border border-neutral-300" />
        <SmallBtn
          onClick={() => {
            if (!draft.trim()) return;
            onChange([...items, draft.trim()]);
            setDraft('');
          }}
        >
          Add
        </SmallBtn>
      </div>
    </div>
  );
}

// ========================= Helpers & Data ========================= //
function setDeep(obj, path, value) {
  const keys = path.split('.');
  const copy = structuredClone(obj);
  let cur = copy;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (!(k in cur)) cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return copy;
}

function blankExperience() { return { role: '', company: '', dates: '', location: '', bullets: [] }; }
function blankEducation() { return { degree: '', school: '', dates: '', location: '' }; }
function blankProject() { return { title: '', org: '', dates: '', location: '', bullets: [] }; }
function blankPublication() { return { title: '', venue: '', meta: '', summary: '' }; }

function emptyData() {
  return {
    header: { name: '', title: '', phone: '', email: '', linkedin: '', location: '' },
    summary: '',
    coreSkills: '',
    experience: [blankExperience()],
    education: [blankEducation()],
    projects: [blankProject()],
    skills: [],
    publications: [],
  };
}

// ========================= Default data ========================= //
const defaultData = {
  header: {
    name: 'AADITYA AGRAWAL',
    title: 'Data & Research Analyst',
    phone: '+44 7867 235 844',
    email: 'aadityaagr1007@gmail.com',
    linkedin: 'linkedin.com/in/aaditya-agrawal',
    location: 'London, UK',
  },
  summary:
    'Analyst-scientist hybrid delivering end to end Python workflows, reproducible analytics, and custom visualisation. Build tools that standardise classification rules and automate reporting. Write clean, documented code and move reliably from ingestion to decision-ready insight in lean teams.',
  coreSkills:
    'Mathematics & Statistics: Linear algebra (eigendecomposition, SVD), calculus (gradients), probability (Bayes, common distributions), statistical inference (hypothesis testing, confidence intervals), optimisation (gradient descent, regularisation), time-series analysis\n' +
    'Machine Learning: Supervised learning (regression, classification), feature engineering, model evaluation (ROC/PR, calibration), cross-validation and time-aware validation; libraries: scikit-learn, XGBoost, basic PyTorch\n' +
    'Data & Analysis: Python, Pandas, NumPy, SQL\n' +
    'Pipelines & ETL: Data pipeline development, ETL design, ingestion/validation, version control (Git), APIs\n' +
    'Dashboards & Visualisation: Power BI, Matplotlib, Plotly, geospatial visualisation, reporting automation\n' +
    'Big Data & Cloud (working knowledge): PySpark/Spark, Databricks, Azure Synapse',
  experience: [
    {
      role: 'Data and Research Analyst',
      company: 'ScaleUp Institute',
      dates: '05/2024 – Present',
      location: 'London, UK',
      bullets: [
        'Delivered fast-paced analysis for leadership and research teams, turning stakeholder questions into clear, actionable findings.',
        'Built Python and SQL pipelines for ingestion, cleaning, validation, and analysis to produce reproducible reports and datasets.',
        'Created interactive visuals and dashboards, including a reusable chart generator in Python used in reports and internal reviews.',
        'Built internal tools that standardise classification and document methods; automated recurring reports to reduce manual effort.',
        'Designed a lightweight database and data dictionary/source register to consolidate core sources; introduced version control for consistency.',
        'Produced analysis used in reports for policy and ecosystem stakeholders, supporting initiatives on UK business growth.'
      ]
    },
    {
      role: 'Data Science Intern',
      company: 'Avanti West Coast',
      dates: '06/2023 – 09/2023',
      location: 'Birmingham, UK',
      bullets: [
        'Identified business-driven insights from company datasets using data science methods.',
        'Analyzed ticket sales and earnings against external factors such as GDP indicators.',
        'Used SQL for extraction, R for cleaning, and Python (XGBoost, feed-forward neural networks) for modeling; built Power BI dashboards.',
        'Isolated five GDP-linked sectors with the largest impact on ticket sales and earnings.',
        'Built a forecasting approach to support planning and decision making.'
      ]
    },
    {
      role: 'DevOps Engineer',
      company: 'Cognizant',
      dates: '10/2020 – 09/2022',
      location: 'Chennai, India',
      bullets: [
        'Automated CI/CD and containerised workloads with Docker and Kubernetes on Azure and IBM Cloud to improve release reliability.'
      ]
    }
  ],
  education: [
    { degree: 'MSc Data Science', school: 'Lancaster University', dates: '2023', location: 'Lancaster, UK' },
    { degree: 'B.Tech Computer Science', school: 'Galgotias University', dates: '2020', location: 'Noida, India' },
  ],
  projects: [
    {
      title: 'UK Scaleup Cluster Map',
      org: 'ScaleUp Institute',
      dates: '2024',
      location: 'London',
      bullets: [
        'Interactive web application for exploring company clusters by sector.',
        'Implemented map layers (polygons and points), filters, and responsive UI using HTML, CSS, JavaScript, and Leaflet.',
        'Automated data prep and deployed via GitHub Pages; documented source notes and update cadence.'
      ],
    },
    {
      title: 'Automated Sector Classification Tool',
      org: 'ScaleUp Institute',
      dates: '2024',
      location: 'London',
      bullets: [
        'Python-based tool that assigns sectors to uploaded company lists using configurable rules.',
        'Produces clean CSV outputs and distribution summaries; reduced manual tagging effort and standardised classifications across research tasks.',
        'Includes method notes and criteria for reuse.'
      ],
    },
    {
      title: 'Face2Sketch and Sketch2Face',
      org: 'Lancaster University',
      dates: '2023',
      location: 'Lancaster',
      bullets: [
        'Built data pipelines and trained two autoencoders plus a conditional GAN to translate faces <-> sketches.',
        'Evaluated reconstruction quality and stability; documented the training workflow for reproducibility.'
      ],
    },
    {
      title: 'Battle Tank via Multi-Agent RL',
      org: 'Lancaster University',
      dates: '2023',
      location: 'Lancaster',
      bullets: [
        'Created a grid-world environment and implemented MADDPG for cooperative/competitive agents.',
        'Tuned reward shaping and evaluation to demonstrate emergent tactics and improved episode returns over baselines.'
      ],
    }
  ],
  // Keep tags tight for ATS keyword match; duplicates okay.
  skills: [
    'Python','Pandas','NumPy','SQL','scikit-learn','XGBoost','PyTorch (basic)',
    'Power BI','Matplotlib','Plotly','Leaflet','Git','APIs',
    'ETL','Data pipelines','Statistical inference','Hypothesis testing','Linear algebra',
    'Time-series analysis','Azure','Spark','Databricks','Azure Synapse'
  ],
  publications: []
};

// ========================= Print styles ========================= //
function PrintStyles() {
  return (
    <style>{`
      :root { --accent: #2B6CB0; }
      body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif; }
      @media print {
        body { background: white; }
        .print\\:hidden { display: none !important; }
        .resume-a4 { box-shadow: none !important; }
        @page { size: A4; margin: 0; }
        .resume-a4 > div { padding: 12mm !important; }
      }
    `}</style>
  );
}

// ========================= Tests ========================= //
function runBasicTests(current) {
  const results = [];
  const assert = (name, cond, message = '') => results.push({ name, pass: !!cond, message });

  // Test 1: header shape
  assert('header has required fields', !!current.header && !!current.header.name && !!current.header.email && !!current.header.phone);

  // Test 2: setDeep immutability
  const before = JSON.stringify(current);
  const updated = setDeep(current, 'header.title', 'Test Title');
  const afterOriginalUnchanged = JSON.stringify(current) === before;
  assert('setDeep does not mutate original', afterOriginalUnchanged);
  assert('setDeep updated value', updated.header.title === 'Test Title');

  // Test 3: Experience items have bullets array
  assert('experience[0] has bullets array', Array.isArray(current.experience?.[0]?.bullets));

  // Test 4: Core skills present and includes Python
  assert('coreSkills contains Python', (current.coreSkills || '').toLowerCase().includes('python'));

  // Test 5: blank factories shape
  const bE = blankExperience();
  const bEd = blankEducation();
  const bP = blankProject();
  const bPub = blankPublication();
  assert('blankExperience shape', !!bE && 'role' in bE && Array.isArray(bE.bullets));
  assert('blankEducation shape', !!bEd && 'degree' in bEd);
  assert('blankProject shape', !!bP && 'title' in bP && Array.isArray(bP.bullets));
  assert('blankPublication shape', !!bPub && 'title' in bPub && typeof bPub.summary === 'string');

  return results;
}
