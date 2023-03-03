const data = [
    {
        name: "ADMINISTRADOR"
    },
    {
        name: "MANAGER"
    },
    {
        name: "AGENTE"
    }
]
const assitenceProvideData = [
    {
        id: 1,
        label: 'Discussed',
        checked: false
    },
    {
        id: 2,
        label: 'Educated',
        checked: false
    },
    {
        id: 3,
        label: 'Referred',
        checked: false
    },
    {
        id: 4,
        label: 'Monitored',
        checked: false
    },
    {
        id: 5,
        label: 'Provided directly',
        checked: false
    },
    {
        id: 6,
        label: 'Other',
        checked: false
    }
]
const goalsAchievedData = [
    {
        id: 1,
        label: 'Yes',
        checked: false
    },
    {
        id: 2,
        label: 'No',
        checked: false
    },
    {
        id: 3,
        label: 'In Progress',
        checked: false
    },
    {
        id: 4,
        label: 'N/A',
        checked: false
    }
]
const serviceAreasData = [
    {
        id: 1,
        domain: 'Placement Stability and Safety',
        goals: 'Ensure placement shows signs of well adjustment (i.e., routines established, school in place, medical in place and counseling if necessary), and ensure placement is safe and appropriate (i.e., sleeping quarters appropriate for participant, food, clothing and home conditions appropriate for the care of a child)',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 2,
        domain: 'Guardianship',
        goals: 'If the sponsor is not a parent or legal guardian, describe efforts made by the sponsor to obtain legal guardianship of the child. If guardianship will not be pursued, explain why',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 3,
        domain: 'Immigration Proceedings',
        goals: 'The PRS provider must monitor and help to facilitate the sponsor’s plan to ensure the UC’s attendance at all immigration court proceedings and compliance with DHS requirements',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 4,
        domain: 'Legal Services',
        goals: 'Assist family in identifying a low cost or free legal service provider in their community',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 5,
        domain: 'Education',
        goals: 'Assist the sponsor in identifying a local school and enrolling the minor',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 6,
        domain: 'Medical Services',
        goals: 'Identify and refer minor to a medical provider in their community, assist with health insurance enrollment, if applicable',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 7,
        domain: 'Individual  Mental Health Services',
        goals: 'Identify and refer minor to a mental health provider, as necessary. Describe the status of the minor’s mental health needs, including any services (e.g. counseling, psychotropic medication) the child receives to address mental health concerns',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 8,
        domain: 'Family Stabilization/ Counseling',
        goals: 'Identify and refer participant and family to family counseling, as necessary',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 9,
        domain: 'Substance abuse',
        goals: 'Describe plans and efforts made (e.g. attending AA or NA meetings, substance abuse counseling) to address the child’s substance abuse issues, as applicable.',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 10,
        domain: 'Parenting/Supervision',
        goals: 'Describe any areas of parenting (e.g. supervision, adhering to appropriate child discipline methods) with which the sponsor needs assistance to meet the child’s needs.',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 11,
        domain: 'Independent Living',
        goals: 'Note any independent living skills the minor seeks to obtain/improve (e.g. finances, work authorization, vocational training, transportation) and plans to help the minor achieve the desired independent living skills',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 12,
        domain: 'Juvenile/Criminal Justice',
        goals: 'Describe any juvenile justice issues, including but not limited to proceedings pertaining to the minor’s criminal case, and the child’s probation services and requirements',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 13,
        domain: 'Gang Prevention',
        goals: 'Provide the sponsor information about gang prevention programs in or around the sponsor’s community',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    },
    {
        id: 14,
        domain: 'Other',
        goals: 'Document any other service areas for which the child needs assistance, the assistance provided, and the outcome or projected outcome after the child and sponsor receive assistance.',
        assitenceProvide: assitenceProvideData,
        narrative: [],
        goalsAchieved: goalsAchievedData
    }
]

module.exports = {
    data,
    serviceAreasData
}