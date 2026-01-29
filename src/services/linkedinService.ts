/**
 * Service to extract profile data from LinkedIn pages.
 * Ported from legacy content.js
 */
export const linkedinService = {
    async extractProfileData() {
        const data: any = {};

        try {
            // Extract profile URL
            data.profileUrl = window.location.href;

            // Extract name
            const nameElement = document.title;
            data.name = nameElement.split('|')[0].trim();

            // Extract headline/title
            const headlineElement = document.querySelector('div.text-body-medium.break-words') as HTMLElement;
            data.headline = headlineElement ? headlineElement.innerText.trim() : '';

            // Extract location
            const locationElement = document.querySelector('span.text-body-small.inline.t-black--light.break-words') as HTMLElement;
            data.location = locationElement ? locationElement.innerText.trim() : '';

            // Extract about section
            const aboutSection = document.querySelector('#about ~ div.display-flex.ph5.pv3') as HTMLElement;
            data.about = aboutSection ? aboutSection.innerText.trim() : '';

            // Extract experience
            const experienceSection = document.querySelector('#experience');
            const experiences: any[] = [];
            if (experienceSection) {
                const section = experienceSection.closest('section');
                if (section) {
                    const expItems = section.querySelectorAll('ul li.artdeco-list__item');
                    expItems.forEach(item => {
                        const titleEl = item.querySelector('span[aria-hidden="true"]') as HTMLElement;
                        const companyEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]') as HTMLElement;
                        const dateEl = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]') as HTMLElement;

                        if (titleEl) {
                            experiences.push({
                                title: titleEl.innerText.trim(),
                                company: companyEl ? companyEl.innerText.trim() : '',
                                duration: dateEl ? dateEl.innerText.trim() : ''
                            });
                        }
                    });
                }
            }
            data.experience = experiences;

            // Extract education
            const educationSection = document.querySelector('#education');
            const educations: any[] = [];
            if (educationSection) {
                const section = educationSection.closest('section');
                if (section) {
                    const eduItems = section.querySelectorAll('ul li.artdeco-list__item');
                    eduItems.forEach(item => {
                        const schoolEl = item.querySelector('span[aria-hidden="true"]') as HTMLElement;
                        const degreeEl = item.querySelector('span.t-14.t-normal span[aria-hidden="true"]') as HTMLElement;
                        const dateEl = item.querySelector('span.t-14.t-normal.t-black--light span[aria-hidden="true"]') as HTMLElement;

                        if (schoolEl) {
                            educations.push({
                                school: schoolEl.innerText.trim(),
                                degree: degreeEl ? degreeEl.innerText.trim() : '',
                                duration: dateEl ? dateEl.innerText.trim() : ''
                            });
                        }
                    });
                }
            }
            data.education = educations;

            // Extract skills
            const skillsSection = document.querySelector('#skills');
            const skills: string[] = [];
            if (skillsSection) {
                const section = skillsSection.closest('section');
                if (section) {
                    const skillItems = section.querySelectorAll('span[aria-hidden="true"]');
                    skillItems.forEach(item => {
                        const skillText = (item as HTMLElement).innerText.trim();
                        if (skillText && skillText.length < 50) {
                            skills.push(skillText);
                        }
                    });
                }
            }
            data.skills = skills;

            return data;
        } catch (error) {
            console.error('Error extracting profile data:', error);
            return null;
        }
    }
};
