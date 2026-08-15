const root = document.querySelector('[data-guided-workflow]');

if (root) {
  const roleField = root.querySelector('[data-guided-team]');
  const companyField = root.querySelector('[data-guided-company]');
  const locationField = root.querySelector('[data-guided-location]');
  const nextButton = root.querySelector('[data-guided-context-next]');
  const reviewPanel = root.querySelector('[data-guided-review-panel]');
  const contextGrid = root.querySelector('.ref-guided-context-grid');

  const ROLE_TITLES = [
    'Software Engineer','Product Manager','Product Engineer','Data Analyst','Data Scientist','Project Manager','Program Manager','Business Analyst','Sales Manager','Account Executive','Customer Success Manager','Marketing Manager','Operations Manager','Financial Analyst','HR Business Partner','People Partner','Recruiter','Talent Acquisition Partner','Product Designer','UX Designer','UI Designer','Graphic Designer','Solutions Architect','Solutions Engineer','Security Analyst','Cybersecurity Engineer','DevOps Engineer','Site Reliability Engineer','Cloud Engineer','Platform Engineer','Machine Learning Engineer','AI Engineer','QA Engineer','Test Engineer','Engineering Manager','Software Engineering Manager','Technical Program Manager','Technical Product Manager','Product Marketing Manager','Product Operations Manager','Growth Manager','Growth Marketing Manager','Strategy Manager','Strategy Consultant','Management Consultant','Consultant','Senior Consultant','Research Analyst','Research Scientist','Business Development Manager','Partnerships Manager','Sales Engineer','Sales Development Representative','Business Development Representative','Key Account Manager','Customer Support Specialist','Customer Support Manager','Implementation Consultant','Implementation Manager','Professional Services Consultant','Finance Manager','Financial Controller','Accountant','FP&A Analyst','Investment Analyst','Risk Analyst','Compliance Analyst','Legal Counsel','Paralegal','Procurement Manager','Supply Chain Manager','Logistics Manager','Manufacturing Engineer','Mechanical Engineer','Electrical Engineer','Civil Engineer','Systems Engineer','Network Engineer','Database Administrator','IT Support Specialist','IT Manager','Information Security Manager','Security Engineer','Solutions Consultant','Technical Support Engineer','Technical Writer','Content Strategist','Content Designer','Content Writer','Communications Manager','Brand Manager','Performance Marketing Manager','Digital Marketing Manager','SEO Specialist','Social Media Manager','Community Manager','Office Manager','Executive Assistant','Chief of Staff','People Operations Manager','Learning and Development Manager','Compensation Analyst','Payroll Specialist','HR Manager','HR Generalist','Product Analyst','Operations Analyst','Revenue Operations Manager','Sales Operations Manager','Marketing Operations Manager','Data Engineer','Analytics Engineer','Business Intelligence Analyst','BI Developer','Mobile Engineer','Frontend Engineer','Backend Engineer','Full Stack Engineer','Embedded Software Engineer','Hardware Engineer','Firmware Engineer','Architect','Design Manager','Creative Director','Art Director','Copywriter','Editor','Journalist','Teacher','Lecturer','Professor','Clinical Research Associate','Research Associate','Lab Technician','Pharmacist','Nurse','Doctor','Healthcare Administrator','Store Manager','Retail Associate','Area Manager','Regional Manager','General Manager','Country Manager','Director','Senior Director','Vice President','Founder','Co-Founder','Chief Executive Officer','Chief Technology Officer','Chief Product Officer','Chief Operating Officer','Chief Financial Officer','Intern','Graduate Engineer','Associate','Senior Associate'
  ];

  const normalize = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  function addReference(field, text) {
    const label = field?.closest('label');
    if (!label || label.querySelector('.cx-context-reference')) return;
    const reference = document.createElement('small');
    reference.className = 'cx-context-reference';
    reference.textContent = text;
    const error = label.querySelector('.ref-field-error');
    if (error) error.before(reference);
    else label.append(reference);
  }

  addReference(companyField, 'Example: VMware / Broadcom');
  addReference(locationField, 'Example: Chennai, Tamil Nadu, India');

  let roleList = null;
  let roleVisible = [];
  let roleActive = -1;

  if (roleField) {
    const roleLabel = roleField.closest('label');
    roleLabel?.classList.add('ref-context-role');
    roleLabel?.classList.remove('ref-context-team');
    const heading = roleLabel?.querySelector('.ref-field-heading');
    if (heading) heading.innerHTML = 'Role <b aria-hidden="true">Required</b>';
    roleField.name = 'role';
    roleField.required = true;
    roleField.placeholder = 'e.g. Product Engineer';
    roleField.setAttribute('autocomplete', 'off');
    roleField.setAttribute('role', 'combobox');
    roleField.setAttribute('aria-autocomplete', 'list');
    addReference(roleField, 'Start typing, e.g. Product Engineer or Software Engineer');

    roleList = document.createElement('div');
    roleList.className = 'cx-role-listbox';
    roleList.id = 'cx-role-options';
    roleList.setAttribute('role', 'listbox');
    roleList.hidden = true;
    roleField.setAttribute('aria-controls', roleList.id);
    roleField.setAttribute('aria-expanded', 'false');
    roleField.insertAdjacentElement('afterend', roleList);

    const closeRoleList = () => {
      roleList.hidden = true;
      roleActive = -1;
      roleField.setAttribute('aria-expanded', 'false');
      roleField.removeAttribute('aria-activedescendant');
    };

    const chooseRole = (title) => {
      roleField.value = title;
      roleField.dispatchEvent(new Event('input', { bubbles: true }));
      closeRoleList();
    };

    const activateRole = (index) => {
      if (!roleVisible.length) return;
      roleActive = Math.max(0, Math.min(index, roleVisible.length - 1));
      [...roleList.querySelectorAll('.cx-role-option')].forEach((option, i) => option.setAttribute('aria-selected', String(i === roleActive)));
      const option = roleList.querySelector(`#cx-role-option-${roleActive}`);
      if (option) {
        roleField.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    };

    const renderRoles = () => {
      const query = normalize(roleField.value);
      roleVisible = query
        ? ROLE_TITLES.filter((title) => normalize(title).startsWith(query)).slice(0, 12)
        : ROLE_TITLES.slice(0, 12);
      roleList.replaceChildren();
      if (!roleVisible.length) {
        const empty = document.createElement('p');
        empty.className = 'cx-role-empty';
        empty.textContent = 'No common title matches yet. You can still enter your exact role.';
        roleList.append(empty);
      } else {
        roleVisible.forEach((title, index) => {
          const option = document.createElement('button');
          option.type = 'button';
          option.className = 'cx-role-option';
          option.id = `cx-role-option-${index}`;
          option.setAttribute('role', 'option');
          option.setAttribute('aria-selected', 'false');
          option.innerHTML = `<strong>${title}</strong><span>Role suggestion</span>`;
          option.addEventListener('pointerdown', (event) => event.preventDefault());
          option.addEventListener('click', () => chooseRole(title));
          roleList.append(option);
        });
        if (ROLE_TITLES.filter((title) => normalize(title).startsWith(query)).length > 12) {
          const more = document.createElement('p');
          more.className = 'cx-role-more';
          more.textContent = 'More roles match — keep typing to narrow the list.';
          roleList.append(more);
        }
      }
      roleActive = -1;
      roleList.hidden = false;
      roleField.setAttribute('aria-expanded', 'true');
    };

    roleField.addEventListener('input', () => {
      roleField.removeAttribute('aria-invalid');
      renderRoles();
    });
    roleField.addEventListener('focus', renderRoles);
    roleField.addEventListener('blur', () => window.setTimeout(closeRoleList, 140));
    roleField.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        if (roleList.hidden) renderRoles();
        activateRole(roleActive + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        activateRole(roleActive <= 0 ? 0 : roleActive - 1);
      } else if (event.key === 'Enter' && roleActive >= 0 && roleVisible[roleActive]) {
        event.preventDefault();
        chooseRole(roleVisible[roleActive]);
      } else if (event.key === 'Escape') {
        closeRoleList();
      }
    });
  }

  let leftField = root.querySelector('[data-guided-left-date]');
  if (!leftField && contextGrid) {
    const label = document.createElement('label');
    label.className = 'ref-field-label ref-context-left-date';
    label.innerHTML = '<span class="ref-field-heading">When did you leave? <b aria-hidden="true">Required</b></span><input type="text" name="left_date" data-guided-left-date required inputmode="numeric" autocomplete="off" maxlength="5" placeholder="MM/YY" aria-describedby="cx-left-date-reference" /><small class="cx-context-reference" id="cx-left-date-reference">Example: 06/24 = June 2024</small><span class="ref-field-error" data-guided-error="leftDate"></span>';
    contextGrid.append(label);
    leftField = label.querySelector('[data-guided-left-date]');
  }

  function parseLeftDate(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
    if (digits.length !== 4) return null;
    const month = Number(digits.slice(0, 2));
    const shortYear = Number(digits.slice(2));
    if (month < 1 || month > 12) return null;
    const now = new Date();
    let year = 2000 + shortYear;
    if (year > now.getFullYear()) year -= 100;
    const date = new Date(year, month - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    if (date > currentMonth) return null;
    return {
      month,
      year,
      display: `${String(month).padStart(2, '0')}/${String(shortYear).padStart(2, '0')}`,
      iso: `${year}-${String(month).padStart(2, '0')}-01`,
    };
  }

  function formatLeftDate(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 4);
    return digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  leftField?.addEventListener('input', () => {
    const formatted = formatLeftDate(leftField.value);
    if (leftField.value !== formatted) leftField.value = formatted;
    leftField.removeAttribute('aria-invalid');
    const error = root.querySelector('[data-guided-error="leftDate"]');
    if (error) error.textContent = '';
  });

  function validateEmploymentContext({ focus = false } = {}) {
    let firstInvalid = null;
    const role = String(roleField?.value || '').trim();
    const left = parseLeftDate(leftField?.value);
    const roleError = roleField?.closest('label')?.querySelector('.ref-field-error');
    const leftError = root.querySelector('[data-guided-error="leftDate"]');

    if (!role) {
      roleField?.setAttribute('aria-invalid', 'true');
      if (roleError) roleError.textContent = 'Add the role you held at this company.';
      firstInvalid ||= roleField;
    } else {
      roleField?.removeAttribute('aria-invalid');
      if (roleError) roleError.textContent = '';
    }

    if (!left) {
      leftField?.setAttribute('aria-invalid', 'true');
      if (leftError) leftError.textContent = 'Enter the month and year you left as MM/YY, for example 06/24.';
      firstInvalid ||= leftField;
    } else {
      leftField?.removeAttribute('aria-invalid');
      if (leftError) leftError.textContent = '';
      leftField.value = left.display;
    }

    if (firstInvalid && focus) firstInvalid.focus();
    return { valid: !firstInvalid, role, left };
  }

  nextButton?.addEventListener('click', (event) => {
    const result = validateEmploymentContext({ focus: true });
    if (result.valid) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const status = root.querySelector('[data-guided-context-status]');
    if (status) status.textContent = 'Add your role and the month/year you left before entering the Story Beats.';
  }, true);

  function ensureReviewContext() {
    const roleDt = reviewPanel?.querySelector('[data-guided-review-context="team"]')?.closest('div')?.querySelector('dt');
    if (roleDt) roleDt.textContent = 'Role';
    const dl = reviewPanel?.querySelector('.ref-context-review');
    if (!dl || dl.querySelector('[data-guided-review-context="leftDate"]')) return;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = '<dt>Left</dt><dd data-guided-review-context="leftDate"></dd>';
    dl.append(wrapper);
  }

  function updateReviewContext() {
    ensureReviewContext();
    const left = parseLeftDate(leftField?.value);
    const node = reviewPanel?.querySelector('[data-guided-review-context="leftDate"]');
    if (node) node.textContent = left ? left.display : 'Not provided';
  }

  ensureReviewContext();
  const reviewObserver = new MutationObserver(() => {
    if (root.dataset.guidedStep === 'review') updateReviewContext();
  });
  reviewObserver.observe(root, { attributes: true, attributeFilter: ['data-guided-step'] });

  document.addEventListener('guidedstoryconfirmed', (event) => {
    const result = validateEmploymentContext();
    if (!result.valid || !event.detail?.context) return;
    event.detail.context.team = result.role;
    event.detail.context.role = result.role;
    event.detail.context.leftDate = result.left.display;
    event.detail.context.leftMonth = result.left.month;
    event.detail.context.leftYear = result.left.year;
    event.detail.context.departureMonth = result.left.iso;
  }, true);
}
