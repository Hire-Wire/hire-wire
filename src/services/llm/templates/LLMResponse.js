const resumeTemplate = 'Use this as the template for the latex resume:' +
    '\\documentclass{resume} % Use the custom resume.cls style\n' +
    '\n' +
    '\\usepackage[left=0.4 in,top=0.4in,right=0.4 in,bottom=0.4in]{geometry} % Document margins\n' +
    '\\newcommand{\\tab}[1]{\\hspace{.2667\\textwidth}\\rlap{#1}} \n' +
    '\\newcommand{\\itab}[1]{\\hspace{0em}\\rlap{#1}}\n' +
    '\\name{Firstname Lastname} % Your name\n' +
    '% You can merge both of these into a single line, if you do not have a website.\n' +
    '\\address{+1(123) 456-7890 \\\\ San Francisco, CA} \n' +
    '\\address{\\href{mailto:contact@faangpath.com}{contact@faangpath.com} \\\\ \\href{https://linkedin.com/company/faangpath}{linkedin.com/company/faangpath} \\\\ \\href{www.faangpath.com}{www.faangpath.com}}  %\n' +
    '\n' +
    '\\begin{document}\n' +
    '\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '%\tOBJECTIVE\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\n' +
    '\\begin{rSection}{OBJECTIVE}\n' +
    '\n' +
    '{Software Engineer with 2+ years of experience in XXX, seeking full-time XXX roles.}\n' +
    '\n' +
    '\n' +
    '\\end{rSection}\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '%\tEDUCATION SECTION\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\n' +
    '\\begin{rSection}{Education}\n' +
    '\n' +
    '{\\bf Master of Computer Science}, Stanford University \\hfill {Expected 2020}\\\\\n' +
    'Relevant Coursework: A, B, C, and D.\n' +
    '\n' +
    '{\\bf Bachelor of Computer Science}, Stanford University \\hfill {2014 - 2017}\n' +
    '%Minor in Linguistics \\smallskip \\\\\n' +
    '%Member of Eta Kappa Nu \\\\\n' +
    '%Member of Upsilon Pi Epsilon \\\\\n' +
    '\n' +
    '\n' +
    '\\end{rSection}\n' +
    '\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '% TECHINICAL STRENGTHS\t\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\\begin{rSection}{SKILLS}\n' +
    '\n' +
    '\\begin{tabular}{ @{} >{\\bfseries}l @{\\hspace{6ex}} l }\n' +
    'Technical Skills & A, B, C, D\n' +
    '\\\\\n' +
    'Soft Skills & A, B, C, D\\\\\n' +
    'XYZ & A, B, C, D\\\\\n' +
    '\\end{tabular}\\\\\n' +
    '\\end{rSection}\n' +
    '\n' +
    '\\begin{rSection}{EXPERIENCE}\n' +
    '\n' +
    '\\textbf{Role Name} \\hfill Jan 2017 - Jan 2019\\\\\n' +
    'Company Name \\hfill \\textit{San Francisco, CA}\n' +
    ' \\begin{itemize}\n' +
    '    \\itemsep -3pt {} \n' +
    '     \\item Achieved X\\% growth for XYZ using A, B, and C skills.\n' +
    '     \\item Led XYZ which led to X\\% of improvement in ABC\n' +
    '    \\item Developed XYZ that did A, B, and C using X, Y, and Z. \n' +
    ' \\end{itemize}\n' +
    ' \n' +
    '\\textbf{Role Name} \\hfill Jan 2017 - Jan 2019\\\\\n' +
    'Company Name \\hfill \\textit{San Francisco, CA}\n' +
    ' \\begin{itemize}\n' +
    '    \\itemsep -3pt {} \n' +
    '     \\item Achieved X\\% growth for XYZ using A, B, and C skills.\n' +
    '     \\item Led XYZ which led to X\\% of improvement in ABC\n' +
    '    \\item Developed XYZ that did A, B, and C using X, Y, and Z. \n' +
    ' \\end{itemize}\n' +
    '\n' +
    '\\end{rSection} \n' +
    '\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '%\tWORK EXPERIENCE SECTION\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\n' +
    '\\begin{rSection}{PROJECTS}\n' +
    '\\vspace{-1.25em}\n' +
    '\\item \\textbf{Hiring Search Tool.} {Built a tool to search for Hiring Managers and Recruiters by using ReactJS, NodeJS, Firebase and boolean queries. Over 25000 people have used it so far, with 5000+ queries being saved and shared, and search results even better than LinkedIn! \\href{https://hiring-search.careerflow.ai/}{(Try it here)}}\n' +
    '\\item \\textbf{Short Project Title.} {Build a project that does something and had quantified success using A, B, and C. This project\'s description spans two lines and also won an award.}\n' +
    '\\item \\textbf{Short Project Title.} {Build a project that does something and had quantified success using A, B, and C. This project\'s description spans two lines and also won an award.}\n' +
    '\\end{rSection} \n' +
    '\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\\begin{rSection}{Extra-Curricular Activities} \n' +
    '\\begin{itemize}\n' +
    '    \\item \tActively write \\href{https://www.faangpath.com/blog/}{blog posts} and social media posts (\\href{https://www.tiktok.com/@faangpath}{TikTok}, \\href{https://www.instagram.com/faangpath/?hl=en}{Instagram}) viewed by over 20K+ job seekers per week to help people with best practices to land their dream jobs. \n' +
    '    \\item\tSample bullet point.\n' +
    '\\end{itemize}\n' +
    '\n' +
    '\n' +
    '\\end{rSection}\n' +
    '\n' +
    '%----------------------------------------------------------------------------------------\n' +
    '\\begin{rSection}{Leadership} \n' +
    '\\begin{itemize}\n' +
    '    \\item Admin for the \\href{https://discord.com/invite/WWbjEaZ}{FAANGPath Discord community} with over 6000+ job seekers and industry mentors. Actively involved in facilitating online events, career conversations, and more alongside other admins and a team of volunteer moderators! \n' +
    '\\end{itemize}\n' +
    '\n' +
    '\n' +
    '\\end{rSection}\n' +
    '\n' +
    '\n' +
    '\\end{document}\n';