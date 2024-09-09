import "./dock.css"; // Ensure you have a separate CSS file for the dock styles

interface DockProps {
  actions: { [key: string]: () => void };
}

export default function Dock({ actions }: DockProps) {
  const icons = [
    {
      name: "arc",
      displayName: "Arc",
      onClick: () => {
        actions["arc"]();
      },
    },
    {
      name: "docker",
      displayName: "Docker",
      onClick: () => {}, // No action for now
    },
    {
      name: "iterm",
      displayName: "iTerm",
      onClick: () => {}, // No action for now
    },
    {
      name: "slack",
      displayName: "Slack",
      onClick: () => {}, // No action for now
    },
    {
      name: "textedit",
      displayName: "TextEdit",
      onClick: () => {}, // No action for now
    },
    {
      name: "vscode",
      displayName: "VSCode",
      onClick: () => {}, // No action for now
    },
    {
      name: "github",
      displayName: "GitHub",
      onClick: () => window.open("https://github.com/Dhruv9449", "_blank"),
    },
    {
      name: "linkedin",
      displayName: "LinkedIn",
      onClick: () =>
        window.open("https://www.linkedin.com/in/dhruv9449/", "_blank"),
    },
    {
      name: "mail",
      displayName: "Mail",
      onClick: () => (window.location.href = "mailto:dhruvshahrds@gmail.com"),
    },
    {
      name: "contact",
      displayName: "Contact",
      onClick: () => {}, // No action for now
    },
  ];

  return (
    <div className="dock">
      {icons.map((icon, index) => (
        <div className="dock-icon" key={index} onClick={icon.onClick}>
          <img
            src={`./icons/${icon.name}.png`}
            alt={icon.name}
            className="icon-image"
          />
          <div className="tooltip">{icon.displayName}</div>
        </div>
      ))}
    </div>
  );
}
