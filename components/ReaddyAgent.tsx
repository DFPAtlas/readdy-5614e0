import Script from "next/script";

export default function ReaddyAgent() {
  return (
    <Script
      src="https://readdy.ai/api/public/assistant/widget?projectId=18288eee-63fa-4165-a658-6aa7ab020255"
      strategy="afterInteractive"
      data-mode="hybrid"
      data-voice-show-transcript="true"
      data-theme="light"
      data-size="compact"
      data-accent-color="#14B8A6"
      data-button-base-color="#000000"
      data-button-accent-color="#FFFFFF"
    />
  );
}