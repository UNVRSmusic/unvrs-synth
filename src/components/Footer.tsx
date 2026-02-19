import "./Footer.css";

const Footer = () => {
  return (
    <div className="synth-footer">
      <p>
        v1.0.0 • Made with ❤️ by{" "}
        <a
          href="https://github.com/UNVRSmusic"
          target="_blank"
          rel="noopener noreferrer"
        >
          UNVRS
        </a>
        {" • "}
        Open source under{" "}
        <a
          href="https://github.com/UNVRSmusic/unvrs-synth/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
        >
          MIT License
        </a>
      </p>
    </div>
  );
};

export default Footer;
