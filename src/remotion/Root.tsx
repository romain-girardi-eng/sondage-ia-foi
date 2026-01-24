import { Composition } from "remotion";
import { SurveyResultsVideo } from "./compositions/SurveyResultsVideo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SurveyResults"
        component={SurveyResultsVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: "IA & Vie Spirituelle",
          subtitle: "Vos Résultats Personnalisés",
          religiosityScore: 3.5,
          aiAdoptionScore: 4.2,
          profileName: "Explorateur Curieux",
          profileEmoji: "🔬",
        }}
      />
    </>
  );
};
