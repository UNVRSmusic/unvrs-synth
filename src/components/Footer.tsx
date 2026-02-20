import "./Footer.css";

const Footer = () => {
  return (
    <div className="synth-footer">
      <p>
        v1.0.0 • Made with ❤️ by{" "}
        <a
          href="https://buymeacoffee.com/UNVRS"
          onClick={() => gtag("event", "buy_me_a_coffee_click")}
          rel="noopener noreferrer"
          target="_blank"
        >
          UNVRS
        </a>
        {" • "}
        Open source under{" "}
        <a
          href="https://github.com/UNVRSmusic/unvrs-synth/blob/main/LICENSE"
          rel="noopener noreferrer"
          target="_blank"
        >
          MIT License
        </a>
      </p>
    </div>
  );
};

export default Footer;
