import styles from "./aboutMeCore.module.css";
import {
  FaEnvelope,
  FaFileLines,
  FaLinkedinIn,
  FaSquareGithub,
  FaSquareXTwitter,
} from "react-icons/fa6";

// Importing JSON data
import skillsData from "../../../data/skillsData.json";
import schoolData from "../../../data/schoolData.json";
import experienceData from "../../../data/experienceData.json";

export default function AboutMeCore() {
  return (
    <div className={styles.aboutMeContent}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <h2>Hi there, I am</h2>
          <h1>Dhruv Shah.</h1>
          <h3>Fullstack Developer & Data Science Enthusiast.</h3>
          <div className={styles.socialLinks}>
            <a href="resume.pdf" target="_blank" rel="noopener noreferrer">
              <FaFileLines />
            </a>
            <a href="mailto:dhruvshahrds@gmail.com">
              <FaEnvelope />
            </a>
            <a
              href="https://linkedin.com/in/Dhruv9449"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://github.com/Dhruv9449"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaSquareGithub />
            </a>
            <a
              href="https://x.com/Dhruv9449"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaSquareXTwitter />
            </a>
          </div>
        </div>
        <div className={styles.heroImage}>
          <img src="hero.jpeg" alt="Dhruv Shah" />
        </div>
      </div>

      {/* Bio Section */}
      <div className={styles.section}>
        <h2>About Me</h2>
        <div className={styles.sectionContent}>
          <p>
            I&apos;m a passionate developer with a knack for backend systems,
            always eager to explore new technologies and solve challenging
            problems.
          </p>
        </div>
      </div>

      {/* Education Section */}
      <div className={styles.section}>
        <h2>Education</h2>
        {schoolData.map((school) => (
          <div className={styles.educationItem} key={school.name}>
            <div className={styles.educationLeft}>
              <strong>{school.degree}</strong>
              <br />
              {school.displayName}
            </div>
            <div className={styles.educationRight}>
              {school.duration}
              <br />
              GPA: {school.gpa}
            </div>
          </div>
        ))}
      </div>

      {/* Experience Section */}
      <div className={styles.section}>
        <h2>Experience</h2>
        {experienceData.map((experience) => (
          <div className={styles.experienceItem} key={experience.name}>
            <div className={styles.experienceHeader}>
              <div className={styles.experienceLeft}>
                <strong>{experience.position}</strong>
                <br />
                {experience.displayName}
              </div>
              <div className={styles.experienceRight}>
                {experience.duration}
                <br />
                {experience.location}
              </div>
            </div>
            <div className={styles.experienceDescription}>
              <ul>
                {experience.description.map((desc, index) => (
                  <li key={index}>{desc}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Section */}
      <div className={styles.section}>
        <h2>Skills</h2>
        <div className={styles.skillList}>
          {skillsData.map((skill) => (
            <div className={styles.skillItem} key={skill.name}>
              <img
                src={skill.icon}
                alt={skill.displayName}
                style={{ width: "20px", marginRight: "5px" }}
              />
              {skill.displayName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
