import React from 'react'
import {
    Svg, Path,
    Document,
    Page,
    Text,
    View,
    pdf,
    Font,
} from '@react-pdf/renderer'
import type { Style } from '@react-pdf/types'
import {
    StructuredResume,
    Experience,
    Project,
    Education,
    Publication,
    ConferenceTrainingWorkshop,
    Award,
    ExtracurricularActivity,
    Language
} from '../lib/schemas/resume'

const Icons = {
    Phone: () => (
        <Svg width="10" height="10" viewBox="0 0 24 24" fill="#666">
            <Path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </Svg>
    ),
    Mail: () => (
        <Svg width="10" height="10" viewBox="0 0 24 24" fill="#666">
            <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </Svg>
    ),
    Location: () => (
        <Svg width="10" height="10" viewBox="0 0 24 24" fill="#666">
            <Path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </Svg>
    ),
};

// Register Google Fonts
Font.register({
    family: 'Roboto',
    src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});
Font.register({
    family: 'Open Sans',
    src: 'https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf'
});
Font.register({
    family: 'Montserrat',
    src: 'https://fonts.gstatic.com/s/montserrat/v15/JTUSjIg1_i6t8kCHKm4df1XxNYG1.ttf'
});
Font.register({
    family: 'Lato',
    src: 'https://fonts.gstatic.com/s/lato/v17/S6uyw4BMUTPHvxk6Xweu.ttf'
});
Font.register({
    family: 'Playfair Display',
    src: 'https://fonts.gstatic.com/s/playfairdisplay/v21/nuFvD7K_rwGaPa3L_OR9n_mPrG-YOC69Uls0vYpD.ttf'
});
Font.register({
    family: 'Oswald',
    src: 'https://fonts.gstatic.com/s/oswald/v35/TK3iWkUHHAIjg752FD8G.ttf'
});

Font.register({
    family: 'Graphik',
    src: 'https://i.forbesimg.com/assets/fonts/Graphik/Graphik-Regular-Web.woff2?v=1'
});

export type PdfStyles = {
    page?: Style | Style[]
    header?: Style | Style[]
    name?: Style | Style[]
    sectionTitle?: Style | Style[]
    entryTitle?: Style | Style[]
    text?: Style | Style[]
    row?: Style | Style[]
}

export const defaultPdfStyles: Required<PdfStyles> = {
    page: { padding: 24, fontSize: 11, fontFamily: 'Helvetica' },
    header: { marginBottom: 8 },
    name: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
    entryTitle: { fontSize: 11, fontWeight: 'bold' },
    text: { fontSize: 10, marginBottom: 2 },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
}

// Helper to safely get personal_data fields
function getPersonalDataField(personal_data: any, field: string): string | undefined {
    const value = personal_data?.[field]
    return typeof value === 'string' ? value : undefined
}

function getPersonalDataLocation(personal_data: any): { city?: string; country?: string } | undefined {
    const location = personal_data?.location
    if (location && typeof location === 'object') {
        return location as { city?: string; country?: string }
    }
    return undefined
}

export async function generateResumePDFReal(
    resume: StructuredResume,
    styles?: PdfStyles,
    template: string = 'classic'
): Promise<Blob> {
    let PdfDocument: React.FC

    switch (template) {
        case 'modern': {
            const ModernDoc = () => <ModernTemplate resume={resume} styles={styles} />
            ModernDoc.displayName = 'ModernDocument'
            PdfDocument = ModernDoc
            break
        }
        case 'novo': {
            const NovoDoc = () => <NovoTemplate resume={resume} styles={styles} />
            NovoDoc.displayName = 'NovoDocument'
            PdfDocument = NovoDoc
            break
        }
        case 'executive': {
            const ExecutiveDoc = () => <ExecutiveTemplate resume={resume} styles={styles} />
            ExecutiveDoc.displayName = 'ExecutiveDocument'
            PdfDocument = ExecutiveDoc
            break
        }
        case 'bold': {
            const BoldDoc = () => <BoldTemplate resume={resume} styles={styles} />
            BoldDoc.displayName = 'BoldDocument'
            PdfDocument = BoldDoc
            break
        }
        case 'gentle': {
            const GentleDoc = () => <GentleTemplate resume={resume} styles={styles} />
            GentleDoc.displayName = 'GentleDocument'
            PdfDocument = GentleDoc
            break
        }
        case 'classic':
        default: {
            const ClassicDoc = () => <ClassicTemplate resume={resume} styles={styles} />
            ClassicDoc.displayName = 'ClassicDocument'
            PdfDocument = ClassicDoc
            break
        }
    }

    const asPdf = pdf(<PdfDocument />)
    const blob = await asPdf.toBlob()
    return blob
}

// PLACEHOLDER: Templates will be added here
// Classic Template - Traditional with left-aligned sections
function ClassicTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')

    return (
        <Document>
            <Page size="A4" style={pdfStyles.page}>
                {/* Header */}
                <View style={pdfStyles.header}>
                    <Text style={pdfStyles.name}>
                        {firstName} {lastName}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, marginTop: 5 }}>
                        {email && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icons.Mail />
                                <Text style={{ ...pdfStyles.text, marginLeft: 3 }}>{email}</Text>
                            </View>
                        )}
                        {phone && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icons.Phone />
                                <Text style={{ ...pdfStyles.text, marginLeft: 3 }}>{phone}</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={pdfStyles.sectionTitle}>SUMMARY</Text>
                        <Text style={pdfStyles.text}>
                            {resume.summary}
                        </Text>
                    </View>
                )}

                {/* Education - Now at the top */}
                {resume.education && resume.education.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>EDUCATION</Text>
                        {resume.education.map((e: Education, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <View style={pdfStyles.row}>
                                    <Text style={pdfStyles.entryTitle}>{e.degree}</Text>
                                    {(e.start_date || e.end_date) && (
                                        <Text style={pdfStyles.text}>{e.start_date} - {e.end_date || 'Present'}</Text>
                                    )}
                                </View>
                                <Text style={pdfStyles.text}>{e.institution}</Text>
                                {e.field_of_study && <Text style={pdfStyles.text}>Field: {e.field_of_study}</Text>}
                                {e.grade && <Text style={pdfStyles.text}>GPA: {e.grade}</Text>}
                                {e.description && <Text style={pdfStyles.text}>{e.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Professional Experience */}
                {resume.experiences && resume.experiences.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>PROFESSIONAL EXPERIENCE</Text>
                        {resume.experiences.map((exp: Experience, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={pdfStyles.row}>
                                    <Text style={pdfStyles.entryTitle}>{exp.job_title}</Text>
                                    <Text style={pdfStyles.text}>{exp.start_date} - {exp.end_date}</Text>
                                </View>
                                {exp.company && <Text style={pdfStyles.text}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</Text>}
                                {exp.description && exp.description.length > 0 && (
                                    <View style={{ marginTop: 3 }}>
                                        {exp.description.map((d: string, idx: number) => (
                                            <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                                <Text style={{ width: 10, fontSize: 10 }}>•</Text>
                                                <Text style={{ flex: 1, fontSize: 10 }}>{d}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>SKILLS</Text>
                        <Text style={pdfStyles.text}>
                            {resume.skills.map((s: { skill_name: string }) => s.skill_name).join(', ')}
                        </Text>
                    </View>
                )}

                {/* Projects */}
                {resume.projects && resume.projects.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>PROJECTS</Text>
                        {resume.projects.map((p: Project, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={pdfStyles.entryTitle}>{p.project_name}</Text>
                                {p.description && <Text style={pdfStyles.text}>{p.description}</Text>}
                                {p.technologies_used && p.technologies_used.length > 0 && (
                                    <Text style={pdfStyles.text}>Technologies: {p.technologies_used.join(', ')}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Publications */}
                {resume.publications && resume.publications.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>PUBLICATIONS</Text>
                        {resume.publications.map((pub: Publication, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={pdfStyles.entryTitle}>{pub.title}</Text>
                                {pub.authors && pub.authors.length > 0 && (
                                    <Text style={pdfStyles.text}>Authors: {pub.authors.join(', ')}</Text>
                                )}
                                <View style={pdfStyles.row}>
                                    {pub.publication_venue && <Text style={pdfStyles.text}>{pub.publication_venue}</Text>}
                                    {pub.date && <Text style={pdfStyles.text}>{pub.date}</Text>}
                                </View>
                                {pub.description && <Text style={pdfStyles.text}>{pub.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Conferences, Trainings & Workshops */}
                {resume.conferences_trainings_workshops && resume.conferences_trainings_workshops.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>CONFERENCES, TRAININGS & WORKSHOPS</Text>
                        {resume.conferences_trainings_workshops.map((item: ConferenceTrainingWorkshop, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={pdfStyles.entryTitle}>{item.name}</Text>
                                {item.organizer && <Text style={pdfStyles.text}>{item.organizer}</Text>}
                                <View style={pdfStyles.row}>
                                    {item.location && <Text style={pdfStyles.text}>{item.location}</Text>}
                                    {item.date && <Text style={pdfStyles.text}>{item.date}</Text>}
                                </View>
                                {item.description && <Text style={pdfStyles.text}>{item.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Awards */}
                {resume.awards && resume.awards.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>AWARDS</Text>
                        {resume.awards.map((award: Award, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={pdfStyles.entryTitle}>{award.title}</Text>
                                <View style={pdfStyles.row}>
                                    {award.issuer && <Text style={pdfStyles.text}>{award.issuer}</Text>}
                                    {award.date && <Text style={pdfStyles.text}>{award.date}</Text>}
                                </View>
                                {award.description && <Text style={pdfStyles.text}>{award.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Extracurricular Activities */}
                {resume.extracurricular_activities && resume.extracurricular_activities.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>EXTRACURRICULAR ACTIVITIES</Text>
                        {resume.extracurricular_activities.map((item: ExtracurricularActivity, i: number) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <Text style={pdfStyles.entryTitle}>{item.activity_name}</Text>
                                <View style={pdfStyles.row}>
                                    {item.organization && <Text style={pdfStyles.text}>{item.organization}</Text>}
                                    {(item.start_date || item.end_date) && (
                                        <Text style={pdfStyles.text}>{item.start_date} - {item.end_date || 'Present'}</Text>
                                    )}
                                </View>
                                {item.role && <Text style={pdfStyles.text}>Role: {item.role}</Text>}
                                {item.description && <Text style={pdfStyles.text}>{item.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {resume.languages && resume.languages.length > 0 && (
                    <View>
                        <Text style={pdfStyles.sectionTitle}>LANGUAGES</Text>
                        <Text style={pdfStyles.text}>
                            {resume.languages.map((l: Language) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(', ')}
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    )
}
ClassicTemplate.displayName = 'ClassicTemplate'

// Modern Template - Sidebar layout with color accents
function ModernTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const pageStyle = Array.isArray(pdfStyles.page) ? pdfStyles.page[0] : pdfStyles.page
    const fontFamily = (pageStyle as Style).fontFamily || 'Helvetica'
    const accentColor = '#2563eb'
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')
    const location = getPersonalDataLocation(resume.personal_data)

    return (
        <Document>
            <Page size="A4" style={{ padding: 0, fontFamily }}>
                <View style={{ display: 'flex', flexDirection: 'row', minHeight: '100%' }}>
                    {/* Sidebar */}
                    <View style={{ width: '30%', backgroundColor: accentColor, padding: 20, color: '#fff' }}>
                        {/* Name in sidebar */}
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 15, color: '#fff' }}>
                            {firstName} {lastName}
                        </Text>

                        {/* Contact Info */}
                        {email && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: '#fff' }}>EMAIL</Text>
                                <Text style={{ fontSize: 8, color: '#fff' }}>{email}</Text>
                            </View>
                        )}
                        {phone && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: '#fff' }}>PHONE</Text>
                                <Text style={{ fontSize: 8, color: '#fff' }}>{phone}</Text>
                            </View>
                        )}
                        {location && (
                            <View style={{ marginBottom: 15 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 2, color: '#fff' }}>LOCATION</Text>
                                <Text style={{ fontSize: 8, color: '#fff' }}>
                                    {location.city}
                                    {location.country ? `, ${location.country}` : ''}
                                </Text>
                            </View>
                        )}

                        {/* Skills in sidebar */}
                        {resume.skills && resume.skills.length > 0 && (
                            <View>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 8, color: '#fff' }}>SKILLS</Text>
                                {resume.skills.map((s: { skill_name: string }, i: number) => (
                                    <Text key={i} style={{ fontSize: 8, marginBottom: 3, color: '#fff' }}>
                                        • {s.skill_name}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {/* Languages in sidebar */}
                        {resume.languages && resume.languages.length > 0 && (
                            <View style={{ marginTop: 15 }}>
                                <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 8, color: '#fff' }}>LANGUAGES</Text>
                                {resume.languages.map((l: Language, i: number) => (
                                    <Text key={i} style={{ fontSize: 8, marginBottom: 3, color: '#fff' }}>
                                        • {l.language}{l.proficiency ? ` (${l.proficiency})` : ''}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Main Content */}
                    <View style={{ width: '70%', padding: 20, fontSize: 10, flexDirection: 'column' }}>
                        {/* Summary */}
                        {resume.summary && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    SUMMARY
                                </Text>
                                <Text style={{ fontSize: 9, lineHeight: 1.4 }}>{resume.summary}</Text>
                            </View>
                        )}

                        {/* Education - Now at the top */}
                        {resume.education && resume.education.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8, marginTop: 10 }}>
                                    EDUCATION
                                </Text>
                                {resume.education.map((e: Education, i: number) => (
                                    <View key={i} style={{ marginBottom: 15 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 10, flex: 1, paddingRight: 10 }}>{e.degree}</Text>
                                            {(e.start_date || e.end_date) && (
                                                <Text style={{ fontSize: 8, color: '#666', flexShrink: 0 }}>{e.start_date} - {e.end_date || 'Present'}</Text>
                                            )}
                                        </View>
                                        <Text style={{ fontSize: 9, color: '#666' }}>{e.institution}</Text>
                                        {e.field_of_study && <Text style={{ fontSize: 8, color: '#888' }}>{e.field_of_study}</Text>}
                                        {e.grade && <Text style={{ fontSize: 8, color: '#888' }}>GPA: {e.grade}</Text>}
                                        {e.description && <Text style={{ fontSize: 8, color: '#888', marginTop: 2 }}>{e.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Experience */}
                        {resume.experiences && resume.experiences.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8, marginTop: 10 }}>
                                    EXPERIENCE
                                </Text>
                                {resume.experiences.map((exp: Experience, i: number) => (
                                    <View key={i} style={{ marginBottom: 15 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <Text style={{ fontWeight: 'bold', fontSize: 10, flex: 1, paddingRight: 10 }}>{exp.job_title}</Text>
                                            <Text style={{ fontSize: 9, color: '#666', flexShrink: 0 }}>{exp.start_date} - {exp.end_date}</Text>
                                        </View>
                                        {exp.company && <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>{exp.company}{exp.location ? ` • ${exp.location}` : ''}</Text>}
                                        {exp.description && exp.description.length > 0 && (
                                            <View style={{ marginTop: 2 }}>
                                                {exp.description.map((d: string, idx: number) => (
                                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                                        <Text style={{ width: 8, fontSize: 9 }}>•</Text>
                                                        <Text style={{ flex: 1, fontSize: 9 }}>{d}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Projects */}
                        {resume.projects && resume.projects.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    PROJECTS
                                </Text>
                                {resume.projects.map((p: Project, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{p.project_name}</Text>
                                        {p.description && <Text style={{ fontSize: 9 }}>{p.description}</Text>}
                                        {p.technologies_used && p.technologies_used.length > 0 && (
                                            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>Technologies: {p.technologies_used.join(', ')}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Publications */}
                        {resume.publications && resume.publications.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    PUBLICATIONS
                                </Text>
                                {resume.publications.map((pub: Publication, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{pub.title}</Text>
                                        {pub.authors && pub.authors.length > 0 && (
                                            <Text style={{ fontSize: 9, color: '#666' }}>Authors: {pub.authors.join(', ')}</Text>
                                        )}
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            {pub.publication_venue && <Text style={{ fontSize: 8, color: '#888' }}>{pub.publication_venue}</Text>}
                                            {pub.date && <Text style={{ fontSize: 8, color: '#888' }}>{pub.date}</Text>}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Conferences */}
                        {resume.conferences_trainings_workshops && resume.conferences_trainings_workshops.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    CONFERENCES & WORKSHOPS
                                </Text>
                                {resume.conferences_trainings_workshops.map((item: ConferenceTrainingWorkshop, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{item.name}</Text>
                                        {item.organizer && <Text style={{ fontSize: 9, color: '#666' }}>{item.organizer}</Text>}
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            {item.location && <Text style={{ fontSize: 8, color: '#888' }}>{item.location}</Text>}
                                            {item.date && <Text style={{ fontSize: 8, color: '#888' }}>{item.date}</Text>}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Awards */}
                        {resume.awards && resume.awards.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    AWARDS
                                </Text>
                                {resume.awards.map((award: Award, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{award.title}</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            {award.issuer && <Text style={{ fontSize: 8, color: '#666' }}>{award.issuer}</Text>}
                                            {award.date && <Text style={{ fontSize: 8, color: '#888' }}>{award.date}</Text>}
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Extracurricular */}
                        {resume.extracurricular_activities && resume.extracurricular_activities.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: accentColor, paddingBottom: 4, marginBottom: 8 }}>
                                    EXTRACURRICULAR
                                </Text>
                                {resume.extracurricular_activities.map((item: ExtracurricularActivity, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontWeight: 'bold', fontSize: 10 }}>{item.activity_name}</Text>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            {item.organization && <Text style={{ fontSize: 9, color: '#666' }}>{item.organization}</Text>}
                                            {(item.start_date || item.end_date) && (
                                                <Text style={{ fontSize: 8, color: '#888' }}>{item.start_date} - {item.end_date || 'Present'}</Text>
                                            )}
                                        </View>
                                        {item.role && <Text style={{ fontSize: 9, color: '#666' }}>{item.role}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    )
}

// Novo Template - Modern professional design with accent colors
function NovoTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const pageStyle = Array.isArray(pdfStyles.page) ? pdfStyles.page[0] : pdfStyles.page
    const fontFamily = (pageStyle as Style).fontFamily || 'Helvetica'
    const darkBg = '#1a1a1a'
    const borderColor = '#eee'
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')
    const location = getPersonalDataLocation(resume.personal_data)

    return (
        <Document>
            <Page size="A4" style={{ padding: 0, fontSize: 11, fontFamily, minHeight: '100%' }}>
                <View style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
                    <View style={{ padding: '40px 40px 20px 40px', borderBottomWidth: 2, borderBottomColor: borderColor }}>
                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                            {/* Left: Name and Summary */}
                            <View style={{ flex: 3.5, paddingRight: 15 }}>
                                <Text style={{ fontSize: 28, fontWeight: 'bold', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    {firstName} {lastName}
                                </Text>
                                {resume.summary && (
                                    <Text style={{ fontSize: 11, color: '#666', textAlign: 'justify', lineHeight: 1.4 }}>
                                        {resume.summary}
                                    </Text>
                                )}
                            </View>

                            <View style={{ flex: 1, alignItems: 'flex-end', fontSize: 10 }}>
                                {email && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{ marginRight: 4, color: '#333' }}>{email}</Text>
                                        <Icons.Mail />
                                    </View>
                                )}
                                {phone && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{ marginRight: 4, color: '#333' }}>{phone}</Text>
                                        <Icons.Phone />
                                    </View>
                                )}
                                {location?.city && (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{ marginRight: 4, color: '#333' }}>
                                            {location.city}
                                            {location.country ? `, ${location.country}` : ''}
                                        </Text>
                                        <Icons.Location />
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Main Content */}
                    <View style={{ padding: '30px 40px' }}>
                        {/* Skills Section */}
                        {resume.skills && resume.skills.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>
                                        Skills
                                    </Text>
                                </View>
                                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                    {resume.skills.map((s: { skill_name: string }, i: number) => (
                                        <View
                                            key={i}
                                            style={{
                                                backgroundColor: darkBg,
                                                padding: '3px 8px',
                                                borderRadius: 3,
                                                marginBottom: 4,
                                                marginRight: 4,
                                            }}
                                        >
                                            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                                                {s.skill_name}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}
                        {/* Education Section - Now at the top */}
                        {resume.education && resume.education.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Education
                                </Text>
                                {resume.education.map((edu: Education, i: number) => (
                                    <View key={i} style={{ borderLeftWidth: 5, borderLeftColor: '#222', paddingLeft: 15, marginBottom: 15 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{edu.degree}</Text>
                                            {edu.end_date && (
                                                <Text style={{ fontSize: 10, color: '#888', fontStyle: 'italic' }}>
                                                    {edu.start_date ? `${edu.start_date} - ` : ''}{edu.end_date}
                                                </Text>
                                            )}
                                        </View>
                                        <Text style={{ fontSize: 12, color: '#444', marginBottom: 3 }}>{edu.institution}</Text>
                                        {edu.field_of_study && (
                                            <Text style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>Field: {edu.field_of_study}</Text>
                                        )}
                                        {edu.grade && (
                                            <Text style={{ fontSize: 10, color: '#666', marginBottom: 2 }}>GPA: {edu.grade}</Text>
                                        )}
                                        {edu.description && (
                                            <Text style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{edu.description}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}



                        {/* Experience Section */}
                        {resume.experiences && resume.experiences.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Work Experience
                                </Text>
                                {resume.experiences.map((exp: Experience, i: number) => (
                                    <View key={i} style={{ borderLeftWidth: 5, borderLeftColor: '#222', paddingLeft: 15, marginBottom: 20 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{exp.job_title}</Text>
                                        </View>
                                        <Text style={{ fontSize: 13, color: '#444', marginBottom: 5 }}>
                                            {exp.company}
                                            {exp.location ? ` • ${exp.location}` : ''}
                                        </Text>
                                        <Text style={{ fontSize: 10, color: '#888', marginBottom: 5, fontStyle: 'italic' }}>
                                            {exp.start_date} - {exp.end_date}
                                        </Text>
                                        {exp.description && exp.description.length > 0 && (
                                            <View style={{ marginTop: 5 }}>
                                                {exp.description.map((desc: string, idx: number) => (
                                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 3 }}>
                                                        <Text style={{ width: 10, fontSize: 11, color: '#444' }}>•</Text>
                                                        <Text style={{ flex: 1, fontSize: 11, color: '#444' }}>{desc}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Projects Section */}
                        {resume.projects && resume.projects.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Projects
                                </Text>
                                {resume.projects.map((proj: Project, i: number) => (
                                    <View key={i} style={{ marginBottom: 15 }}>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 3 }}>
                                            {proj.project_name}
                                        </Text>
                                        {proj.description && (
                                            <Text style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>
                                                {proj.description}
                                            </Text>
                                        )}
                                        {proj.technologies_used && proj.technologies_used.length > 0 && (
                                            <Text style={{ fontSize: 10, color: '#777', marginBottom: 2 }}>
                                                Technologies: {proj.technologies_used.join(', ')}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Publications Section */}
                        {resume.publications && resume.publications.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Publications
                                </Text>
                                {resume.publications.map((pub: Publication, i: number) => (
                                    <View key={i} style={{ marginBottom: 12 }}>
                                        <Text style={{ fontSize: 13, fontWeight: 'bold', marginBottom: 2 }}>{pub.title}</Text>
                                        {pub.authors && pub.authors.length > 0 && (
                                            <Text style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>{pub.authors.join(', ')}</Text>
                                        )}
                                        {pub.publication_venue && <Text style={{ fontSize: 10, color: '#666' }}>{pub.publication_venue}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Awards Section */}
                        {resume.awards && resume.awards.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Awards
                                </Text>
                                {resume.awards.map((award: Award, i: number) => (
                                    <View key={i} style={{ marginBottom: 10 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 12, fontWeight: 'bold' }}>{award.title}</Text>
                                            {award.date && <Text style={{ fontSize: 10, color: '#888' }}>{award.date}</Text>}
                                        </View>
                                        {award.issuer && <Text style={{ fontSize: 10, color: '#555' }}>{award.issuer}</Text>}
                                        {award.description && <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{award.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Conferences Section */}
                        {resume.conferences_trainings_workshops && resume.conferences_trainings_workshops.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Conferences & Workshops
                                </Text>
                                {resume.conferences_trainings_workshops.map((item: ConferenceTrainingWorkshop, i: number) => (
                                    <View key={i} style={{ marginBottom: 12 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item.name}</Text>
                                            {item.date && <Text style={{ fontSize: 10, color: '#888' }}>{item.date}</Text>}
                                        </View>
                                        {item.organizer && <Text style={{ fontSize: 10, color: '#555' }}>{item.organizer}</Text>}
                                        {item.location && <Text style={{ fontSize: 10, color: '#666' }}>{item.location}</Text>}
                                        {item.description && <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{item.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Extracurricular Section */}
                        {resume.extracurricular_activities && resume.extracurricular_activities.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Extracurricular Activities
                                </Text>
                                {resume.extracurricular_activities.map((item: ExtracurricularActivity, i: number) => (
                                    <View key={i} style={{ marginBottom: 12 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{item.activity_name}</Text>
                                            {(item.start_date || item.end_date) && (
                                                <Text style={{ fontSize: 10, color: '#888' }}>{item.start_date} - {item.end_date || 'Present'}</Text>
                                            )}
                                        </View>
                                        {item.organization && <Text style={{ fontSize: 11, color: '#444' }}>{item.organization}</Text>}
                                        {item.role && <Text style={{ fontSize: 10, color: '#666' }}>{item.role}</Text>}
                                        {item.description && <Text style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{item.description}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Languages Section */}
                        {resume.languages && resume.languages.length > 0 && (
                            <View style={{ marginBottom: 25 }}>
                                <Text style={{ fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 }}>
                                    Languages
                                </Text>
                                <View style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                                    {resume.languages.map((l: Language, i: number) => (
                                        <Text key={i} style={{ fontSize: 11, marginRight: 15 }}>
                                            {l.language}{l.proficiency ? ` (${l.proficiency})` : ''}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    )
}
NovoTemplate.displayName = 'NovoTemplate'
// Bold Template - High contrast, strong typography
function BoldTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const pageStyle = Array.isArray(pdfStyles.page) ? pdfStyles.page[0] : pdfStyles.page
    const fontFamily = (pageStyle as Style).fontFamily || 'Helvetica'
    const darkColor = '#1a1a1a'
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')

    return (
        <Document>
            <Page size="A4" style={{ padding: 28, fontSize: 11, fontFamily, minHeight: '100%' }}>
                {/* Large Name Header */}
                <View style={{ marginBottom: 24, borderBottomWidth: 3, borderBottomColor: darkColor, paddingBottom: 12 }}>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: darkColor }}>
                        {firstName}
                    </Text>
                    <Text style={{ fontSize: 28, fontWeight: '900', color: darkColor }}>
                        {lastName}
                    </Text>
                    {email && (
                        <Text style={{ fontSize: 10, marginTop: 8, color: '#555' }}>
                            {email} | {phone || 'No phone'}
                        </Text>
                    )}
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>SUMMARY</Text>
                        </View>
                        <Text style={{ fontSize: 10 }}>{resume.summary}</Text>
                    </View>
                )}

                {/* Education - Now at the top */}
                {resume.education && resume.education.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>EDUCATION</Text>
                        </View>
                        {resume.education.map((e: Education, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700' }}>{e.degree}</Text>
                                    {(e.start_date || e.end_date) && (
                                        <Text style={{ fontSize: 9, color: '#777' }}>{e.start_date} - {e.end_date || 'Present'}</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 10, color: '#555' }}>{e.institution}</Text>
                                {e.field_of_study && <Text style={{ fontSize: 9, color: '#777' }}>{e.field_of_study}</Text>}
                                {e.grade && <Text style={{ fontSize: 9, color: '#777' }}>GPA: {e.grade}</Text>}
                                {e.description && <Text style={{ fontSize: 9, color: '#777', marginTop: 2 }}>{e.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Professional Experience */}
                {resume.experiences && resume.experiences.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>PROFESSIONAL EXPERIENCE</Text>
                        </View>
                        {resume.experiences.map((exp: Experience, i: number) => (
                            <View key={i} style={{ marginBottom: 14 }}>
                                <Text style={{ fontSize: 12, fontWeight: '800', color: darkColor }}>{exp.job_title}</Text>
                                <Text style={{ fontSize: 11, color: '#333', marginBottom: 4 }}>
                                    {exp.company} — {exp.start_date} to {exp.end_date}
                                </Text>
                                {exp.description && exp.description.length > 0 && (
                                    <View style={{ marginTop: 4 }}>
                                        {exp.description.map((d: string, idx: number) => (
                                            <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                                <Text style={{ width: 10, fontSize: 10 }}>▸</Text>
                                                <Text style={{ flex: 1, fontSize: 10 }}>{d}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {resume.skills && resume.skills.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>TECHNICAL SKILLS</Text>
                        </View>
                        <Text style={{ fontSize: 10 }}>
                            {resume.skills.map((s: { skill_name: string }) => s.skill_name).join(' • ')}
                        </Text>
                    </View>
                )}

                {/* Publications */}
                {resume.publications && resume.publications.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>PUBLICATIONS</Text>
                        </View>
                        {resume.publications.map((pub: Publication, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 11, fontWeight: '700' }}>{pub.title}</Text>
                                {pub.authors && pub.authors.length > 0 && (
                                    <Text style={{ fontSize: 10, color: '#555' }}>{pub.authors.join(', ')}</Text>
                                )}
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {pub.publication_venue && <Text style={{ fontSize: 9, color: '#777' }}>{pub.publication_venue}</Text>}
                                    {pub.date && <Text style={{ fontSize: 9, color: '#777' }}>{pub.date}</Text>}
                                </View>
                                {pub.description && <Text style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{pub.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Conferences */}
                {resume.conferences_trainings_workshops && resume.conferences_trainings_workshops.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>CONFERENCES & WORKSHOPS</Text>
                        </View>
                        {resume.conferences_trainings_workshops.map((item: ConferenceTrainingWorkshop, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <Text style={{ fontSize: 11, fontWeight: '700' }}>{item.name}</Text>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    {item.organizer && <Text style={{ fontSize: 10, color: '#555' }}>{item.organizer}</Text>}
                                    {item.date && <Text style={{ fontSize: 9, color: '#777' }}>{item.date}</Text>}
                                </View>
                                {item.location && <Text style={{ fontSize: 9, color: '#777' }}>{item.location}</Text>}
                                {item.description && <Text style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{item.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Awards */}
                {resume.awards && resume.awards.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>AWARDS</Text>
                        </View>
                        {resume.awards.map((award: Award, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700' }}>{award.title}</Text>
                                    {award.date && <Text style={{ fontSize: 9, color: '#777' }}>{award.date}</Text>}
                                </View>
                                {award.issuer && <Text style={{ fontSize: 10, color: '#555' }}>{award.issuer}</Text>}
                                {award.description && <Text style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{award.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Extracurricular */}
                {resume.extracurricular_activities && resume.extracurricular_activities.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>EXTRACURRICULAR ACTIVITIES</Text>
                        </View>
                        {resume.extracurricular_activities.map((item: ExtracurricularActivity, i: number) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ fontSize: 11, fontWeight: '700' }}>{item.activity_name}</Text>
                                    {(item.start_date || item.end_date) && (
                                        <Text style={{ fontSize: 9, color: '#777' }}>{item.start_date} - {item.end_date || 'Present'}</Text>
                                    )}
                                </View>
                                <Text style={{ fontSize: 10, color: '#555' }}>{item.organization}</Text>
                                {item.role && <Text style={{ fontSize: 10, color: '#555' }}>{item.role}</Text>}
                                {item.description && <Text style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{item.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Languages */}
                {resume.languages && resume.languages.length > 0 && (
                    <View>
                        <View style={{ backgroundColor: darkColor, padding: 12, marginBottom: 12 }}>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>LANGUAGES</Text>
                        </View>
                        <Text style={{ fontSize: 10 }}>
                            {resume.languages.map((l: Language) => `${l.language}${l.proficiency ? ` (${l.proficiency})` : ''}`).join(' • ')}
                        </Text>
                    </View>
                )}
            </Page>
        </Document>
    )
}
BoldTemplate.displayName = 'BoldTemplate'

// Executive Template - Professional one-page layout
function ExecutiveTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const pageStyle = Array.isArray(pdfStyles.page) ? pdfStyles.page[0] : pdfStyles.page
    const fontFamily = (pageStyle as Style).fontFamily || 'Helvetica'
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')
    const location = getPersonalDataLocation(resume.personal_data)

    return (
        <Document>
            <Page size="A4" style={{ padding: 20, fontSize: 10, fontFamily, minHeight: '100%' }}>
                {/* Compact Header */}
                <View style={{ marginBottom: 12, paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#2563eb' }}>
                    <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 4 }}>
                        {firstName} {lastName}
                    </Text>
                    <View style={{ display: 'flex', flexDirection: 'row', gap: 15, fontSize: 9 }}>
                        {email && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icons.Mail />
                                <Text style={{ marginLeft: 3 }}>{email}</Text>
                            </View>
                        )}
                        {phone && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icons.Phone />
                                <Text style={{ marginLeft: 3 }}>{phone}</Text>
                            </View>
                        )}
                        {location?.city && (
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Icons.Location />
                                <Text style={{ marginLeft: 3 }}>
                                    {location.city}
                                    {location.country ? `, ${location.country}` : ''}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={{ marginBottom: 10 }}>
                        <Text style={{ fontSize: 10, color: '#444' }}>
                            {resume.summary}
                        </Text>
                    </View>
                )}

                {/* Two Column Layout */}
                <View style={{ display: 'flex', flexDirection: 'row', gap: 15 }}>
                    {/* Left Column */}
                    <View style={{ flex: 1 }}>
                        {/* Education - Now at the top of left column */}
                        {resume.education && resume.education.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Education
                                </Text>
                                {resume.education.map((edu: Education, i: number) => (
                                    <View key={i} style={{ marginBottom: 8 }}>
                                        <Text style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 1 }}>
                                            {edu.degree}
                                        </Text>
                                        <Text style={{ fontSize: 9, color: '#666' }}>{edu.institution}</Text>
                                        {edu.field_of_study && <Text style={{ fontSize: 8, color: '#999' }}>{edu.field_of_study}</Text>}
                                        {edu.grade && <Text style={{ fontSize: 8, color: '#999' }}>GPA: {edu.grade}</Text>}
                                        {edu.end_date && (
                                            <Text style={{ fontSize: 8, color: '#999', marginTop: 1 }}>{edu.start_date ? `${edu.start_date} - ` : ''}{edu.end_date}</Text>
                                        )}
                                        {edu.description && (
                                            <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>{edu.description}</Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Skills */}
                        {resume.skills && resume.skills.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Skills
                                </Text>
                                {resume.skills.map((s: { skill_name: string }, i: number) => (
                                    <Text key={i} style={{ fontSize: 9, marginBottom: 2, color: '#555' }}>
                                        • {s.skill_name}
                                    </Text>
                                ))}
                            </View>
                        )}

                        {/* Languages */}
                        {resume.languages && resume.languages.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Languages
                                </Text>
                                {resume.languages.map((l: Language, i: number) => (
                                    <Text key={i} style={{ fontSize: 9, marginBottom: 2, color: '#555' }}>
                                        • {l.language}{l.proficiency ? ` (${l.proficiency})` : ''}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Right Column */}
                    <View style={{ flex: 1.5 }}>
                        {/* Experience */}
                        {resume.experiences && resume.experiences.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Experience
                                </Text>
                                {resume.experiences.map((exp: Experience, i: number) => (
                                    <View key={i} style={{ marginBottom: 8 }}>
                                        <View style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 10, fontWeight: 'bold' }}>{exp.job_title}</Text>
                                            <Text style={{ fontSize: 8, color: '#999' }}>{exp.start_date} - {exp.end_date}</Text>
                                        </View>
                                        <Text style={{ fontSize: 9, color: '#666', marginBottom: 2 }}>
                                            {exp.company}
                                            {exp.location ? `, ${exp.location}` : ''}
                                        </Text>
                                        {exp.description && exp.description.length > 0 && (
                                            <View style={{ marginTop: 2 }}>
                                                {exp.description.map((d: string, idx: number) => (
                                                    <View key={idx} style={{ flexDirection: 'row', marginBottom: 2 }}>
                                                        <Text style={{ width: 8, fontSize: 8, color: '#555' }}>•</Text>
                                                        <Text style={{ flex: 1, fontSize: 8, color: '#555' }}>{d}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Projects */}
                        {resume.projects && resume.projects.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Projects
                                </Text>
                                {resume.projects.map((proj: Project, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold', marginBottom: 1 }}>
                                            {proj.project_name}
                                        </Text>
                                        {proj.description && (
                                            <Text style={{ fontSize: 8, color: '#555' }}>
                                                {proj.description}
                                            </Text>
                                        )}
                                        {proj.technologies_used && proj.technologies_used.length > 0 && (
                                            <Text style={{ fontSize: 7, color: '#888', marginTop: 1 }}>
                                                {proj.technologies_used.join(', ')}
                                            </Text>
                                        )}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Awards */}
                        {resume.awards && resume.awards.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Awards
                                </Text>
                                {resume.awards.map((award: Award, i: number) => (
                                    <View key={i} style={{ marginBottom: 4 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{award.title}</Text>
                                        {award.issuer && <Text style={{ fontSize: 8, color: '#666' }}>{award.issuer}</Text>}
                                        {award.date && <Text style={{ fontSize: 7, color: '#888' }}>{award.date}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Publications */}
                        {resume.publications && resume.publications.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Publications
                                </Text>
                                {resume.publications.map((pub: Publication, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{pub.title}</Text>
                                        {pub.publication_venue && <Text style={{ fontSize: 8, color: '#666' }}>{pub.publication_venue}</Text>}
                                        {pub.date && <Text style={{ fontSize: 7, color: '#888' }}>{pub.date}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Conferences */}
                        {resume.conferences_trainings_workshops && resume.conferences_trainings_workshops.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Conferences
                                </Text>
                                {resume.conferences_trainings_workshops.map((item: ConferenceTrainingWorkshop, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{item.name}</Text>
                                        {item.organizer && <Text style={{ fontSize: 8, color: '#666' }}>{item.organizer}</Text>}
                                        {item.date && <Text style={{ fontSize: 7, color: '#888' }}>{item.date}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Extracurricular */}
                        {resume.extracurricular_activities && resume.extracurricular_activities.length > 0 && (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6, color: '#2563eb', textTransform: 'uppercase' }}>
                                    Activities
                                </Text>
                                {resume.extracurricular_activities.map((item: ExtracurricularActivity, i: number) => (
                                    <View key={i} style={{ marginBottom: 6 }}>
                                        <Text style={{ fontSize: 9, fontWeight: 'bold' }}>{item.activity_name}</Text>
                                        {item.organization && <Text style={{ fontSize: 8, color: '#666' }}>{item.organization}</Text>}
                                        {item.role && <Text style={{ fontSize: 8, color: '#666' }}>{item.role}</Text>}
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>
                </View>
            </Page>
        </Document>
    )
}
ExecutiveTemplate.displayName = 'ExecutiveTemplate'
// Gentle Template - Soft colors, elegant serif typography
function GentleTemplate({ resume, styles }: { resume: StructuredResume; styles?: PdfStyles }) {
    const pdfStyles = { ...defaultPdfStyles, ...styles } as Required<PdfStyles>
    const pageStyle = Array.isArray(pdfStyles.page) ? pdfStyles.page[0] : pdfStyles.page
    const fontFamily = (pageStyle as Style).fontFamily || 'Helvetica'
    const primaryColor = '#4a5568'
    const accentColor = '#edf2f7'
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')

    return (
        <Document>
            <Page size="A4" style={{ padding: 40, fontSize: 11, fontFamily, color: primaryColor, minHeight: '100%' }}>
                {/* Header */}
                <View style={{ textAlign: 'center', marginBottom: 30 }}>
                    <Text style={{ fontSize: 32, fontWeight: 'bold', letterSpacing: 2, marginBottom: 8, color: '#2d3748' }}>
                        {firstName} {lastName}
                    </Text>
                    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15, fontSize: 10, color: '#718096' }}>
                        <Text>{email}</Text>
                        <Text>•</Text>
                        <Text>{phone}</Text>
                    </View>
                </View>

                {/* Summary */}
                {resume.summary && (
                    <View style={{ marginBottom: 25, padding: 15, backgroundColor: accentColor, borderRadius: 8 }}>
                        <Text style={{ fontSize: 10, lineHeight: 1.6, fontStyle: 'italic', textAlign: 'center' }}>
                            "{resume.summary}"
                        </Text>
                    </View>
                )}

                {/* Education - Now at the top */}
                {resume.education && resume.education.length > 0 && (
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e0', paddingBottom: 4 }}>
                            Education
                        </Text>
                        {resume.education.map((e: Education, i: number) => (
                            <View key={i} style={{ marginBottom: 12 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{e.degree}</Text>
                                    <Text style={{ fontSize: 9, color: '#a0aec0' }}>{e.start_date} - {e.end_date || 'Present'}</Text>
                                </View>
                                <Text style={{ fontSize: 10 }}>{e.institution}</Text>
                                {e.field_of_study && <Text style={{ fontSize: 9, color: '#718096' }}>{e.field_of_study}</Text>}
                                {e.grade && <Text style={{ fontSize: 9, color: '#718096' }}>GPA: {e.grade}</Text>}
                                {e.description && <Text style={{ fontSize: 9, color: '#718096', marginTop: 3 }}>{e.description}</Text>}
                            </View>
                        ))}
                    </View>
                )}

                {/* Experience */}
                {resume.experiences && resume.experiences.length > 0 && (
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e0', paddingBottom: 4 }}>
                            Experience
                        </Text>
                        {resume.experiences.map((exp: Experience, i: number) => (
                            <View key={i} style={{ marginBottom: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                                    <Text style={{ fontWeight: 'bold' }}>{exp.job_title}</Text>
                                    <Text style={{ fontSize: 9, color: '#a0aec0' }}>{exp.start_date} - {exp.end_date}</Text>
                                </View>
                                <Text style={{ fontSize: 10, color: '#4a5568', marginBottom: 4 }}>{exp.company}{exp.location ? ` | ${exp.location}` : ''}</Text>
                                {exp.description && exp.description.length > 0 && (
                                    <View style={{ gap: 4 }}>
                                        {exp.description.map((d: string, idx: number) => (
                                            <View key={idx} style={{ flexDirection: 'row' }}>
                                                <Text style={{ width: 12, color: '#cbd5e0' }}>~</Text>
                                                <Text style={{ flex: 1, fontSize: 9, color: '#718096', lineHeight: 1.4 }}>{d}</Text>
                                            </View>
                                        ))}
                                    </View>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {resume.projects && resume.projects.length > 0 && (
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#cbd5e0', paddingBottom: 4 }}>
                            Major Projects
                        </Text>
                        {resume.projects.map((p: Project, i: number) => (
                            <View key={i} style={{ marginBottom: 10 }}>
                                <Text style={{ fontWeight: 'bold', marginBottom: 2 }}>{p.project_name}</Text>
                                {p.description && <Text style={{ fontSize: 9, color: '#718096' }}>{p.description}</Text>}
                                {p.technologies_used && p.technologies_used.length > 0 && (
                                    <Text style={{ fontSize: 8, color: '#a0aec0', marginTop: 2 }}>Tools: {p.technologies_used.join(', ')}</Text>
                                )}
                            </View>
                        ))}
                    </View>
                )}

                {/* Bottom Section: Skills & Languages */}
                <View style={{ flexDirection: 'row', gap: 40 }}>
                    {resume.skills && resume.skills.length > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2d3748' }}>Expertise</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {resume.skills.map((s: { skill_name: string }, i: number) => (
                                    <Text key={i} style={{ fontSize: 9, padding: '2 6', backgroundColor: accentColor, borderRadius: 4 }}>
                                        {s.skill_name}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    )}

                    {resume.languages && resume.languages.length > 0 && (
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 8, color: '#2d3748' }}>Languages</Text>
                            {resume.languages.map((l: Language, i: number) => (
                                <Text key={i} style={{ fontSize: 9, marginBottom: 4 }}>
                                    {l.language} — <Text style={{ color: '#a0aec0' }}>{l.proficiency}</Text>
                                </Text>
                            ))}
                        </View>
                    )}
                </View>
            </Page>
        </Document>
    )
}
GentleTemplate.displayName = 'GentleTemplate'

export function generateResumeHTML(resume: StructuredResume): string {
    const firstName = getPersonalDataField(resume.personal_data, 'first_name')
    const lastName = getPersonalDataField(resume.personal_data, 'last_name')
    const email = getPersonalDataField(resume.personal_data, 'email')
    const phone = getPersonalDataField(resume.personal_data, 'phone')

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${firstName} ${lastName} - Resume</title>
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; }
        h1 { margin-bottom: 5px; }
        .contact { color: #666; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; border-bottom: 2px solid #eee; padding-bottom: 5px; margin-bottom: 15px; text-transform: uppercase; font-size: 0.9em; }
        .entry { margin-bottom: 15px; }
        .entry-header { display: flex; justify-content: space-between; font-weight: bold; }
        .entry-sub { color: #666; margin-bottom: 5px; }
        ul { margin: 5px 0; padding-left: 20px; }
    </style>
</head>
<body>
    <h1>${firstName} ${lastName}</h1>
    <div class="contact">
        ${email ? `<span>${email}</span>` : ''}
        ${phone ? `<span> | ${phone}</span>` : ''}
    </div>

    ${resume.summary ? `
    <div class="section">
        <div class="section-title">Professional Summary</div>
        <p>${resume.summary}</p>
    </div>
    ` : ''}

    ${resume.education && resume.education.length > 0 ? `
    <div class="section">
        <div class="section-title">Education</div>
        ${resume.education.map((e: Education) => `
            <div class="entry">
                <div class="entry-header">
                    <span>${e.degree}</span>
                    <span>${e.start_date} - ${e.end_date || 'Present'}</span>
                </div>
                <div class="entry-sub">${e.institution}</div>
                ${e.description ? `<p>${e.description}</p>` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${resume.experiences && resume.experiences.length > 0 ? `
    <div class="section">
        <div class="section-title">Professional Experience</div>
        ${resume.experiences.map((exp: Experience) => `
            <div class="entry">
                <div class="entry-header">
                    <span>${exp.job_title}</span>
                    <span>${exp.start_date} - ${exp.end_date}</span>
                </div>
                <div class="entry-sub">${exp.company}${exp.location ? `, ${exp.location}` : ''}</div>
                ${exp.description && exp.description.length > 0 ? `
                    <ul>
                        ${exp.description.map((d: string) => `<li>${d}</li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('')}
    </div>
    ` : ''}

    ${resume.skills && resume.skills.length > 0 ? `
    <div class="section">
        <div class="section-title">Skills</div>
        <p>${resume.skills.map((s: { skill_name: string }) => s.skill_name).join(', ')}</p>
    </div>
    ` : ''}
</body>
</html>`;
}

export function downloadResumeAsHTML(resume: StructuredResume) {
    const html = generateResumeHTML(resume);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.displayName || 'resume'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function downloadResumeAsJSON(resume: StructuredResume) {
    const json = JSON.stringify(resume, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume.displayName || 'resume'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
