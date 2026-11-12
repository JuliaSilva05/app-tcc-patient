import axiosInstance from "@/services/apiConfig";
import { Image } from "expo-image";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { View, Pressable, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from 'expo-speech';
import { useSession } from "@/context/ctx";
import {
  useAudioRecorder,
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorderState,
  useAudioPlayer,
  useAudioPlayerStatus,
} from 'expo-audio';
import { File } from "expo-file-system";
import { Host, CircularProgressIndicator } from "@expo/ui/jetpack-compose";
import { fetch } from "expo/fetch";

type Tips = {
  _id: string;
  text: string;
  audio?: Audio | null;
  visible: boolean;
}

type Question = {
  _id: string;
  description: string;
  descriptionAudio: Audio | null;
  imageKey: string;
  imageUrl: string;
  tips: Tips[];
}

type Audio = {
  url: string | null;
  mimeType: string | null | undefined;
  durationSec: number;
  sizeBytes: number;
}


const uploadAudio = async (
  audioUri: string,
  upload: {
    putUrl: string;
    contentType: string;
  }
) => {
  const audioFile = new File(audioUri);

  if (!audioFile.exists || audioFile.size === 0) {
    throw new Error("Audio file does not exist or is empty");
  }

  const response = await fetch(upload.putUrl, {
    method: "PUT",
    headers: {
      "Content-Type": upload.contentType,
    },
    body: audioFile,
  });

  if (!response.ok) {
    throw new Error(
      `Audio upload failed: ${response.status} ${await response.text()}`
    );
  }

  console.log("Audio uploaded successfully:", {
    size: audioFile.size,
    contentType: upload.contentType,
  });
};

export default function Activity() {
  const { assignmentId, patientId, activityId, questionsCount } = useLocalSearchParams();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [currentTips, setCurrentTips] = useState<Tips[]>();
  const visibleTip = currentTips?.find(v => v.visible);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImg, setIsLoadingImg] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async (): Promise<Audio> => {
    // Capture duration before stopping
    const durationSec = Math.round(
      recorderState.durationMillis / 1000
    );

    // Finish recording before accessing the file
    await audioRecorder.stop();

    const uri = audioRecorder.uri;

    if (!uri) {
      throw new Error("Audio recording URI not found");
    }

    const audioFile = new File(uri);

    if (!audioFile.exists || audioFile.size === 0) {
      throw new Error("Recorded audio file is empty or missing");
    }

    const recordedAudio: Audio = {
      url: uri,
      mimeType: "audio/mp4",
      durationSec,
      sizeBytes: audioFile.size,
    };

    console.log("Recorded audio:", recordedAudio);

    return recordedAudio;
  };

  useEffect(() => {
    const getCurrentQuestion = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(`api/get-activity-questions-data/${activityId}/${currentQuestionIndex}`)

        if (data) {
          setCurrentQuestion(data.data);
          setCurrentTips(data.data.tips);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentQuestion();

  }, [currentQuestionIndex]);



  const [isRecorderReady, setIsRecorderReady] = useState(false);

  // Prevent duplicate submissions
  const submittingRef = useRef(false);

  // Preserve completed audio if upload fails and must be retried
  const recordedAudioRef = useRef<Audio | null>(null);


  useEffect(() => {
    let cancelled = false;

    const startRecording = async () => {
      try {
        const permission =
          await AudioModule.requestRecordingPermissionsAsync();

        if (!permission.granted) {
          if (!cancelled) {
            Alert.alert(
              "Microphone permission required",
              "Please allow microphone access to record your answer."
            );
          }
          return;
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });

        if (cancelled) return;

        await audioRecorder.prepareToRecordAsync();

        if (cancelled) return;

        audioRecorder.record();

        setIsRecorderReady(true);

        console.log("Recording started automatically");

      } catch (error) {
        if (!cancelled) {
          console.error("Failed to start recording:", error);
        }
      }
    };

    void startRecording();

    return () => {
      cancelled = true;

      // Stop recording if the screen unmounts
      // without submitting.
      if (audioRecorder.getStatus().isRecording) {
        void audioRecorder.stop().catch(console.error);
      }
    };
  }, [audioRecorder]);

  
  const handleSubmit = async () => {
    if (
      submittingRef.current ||
      (!isRecorderReady && !recordedAudioRef.current)
    ) return;

    submittingRef.current = true;

    try {
      setIsSubmitting(true);

      // const recordedAudio = await stopRecording();
      const recordedAudio =
        recordedAudioRef.current ?? await stopRecording();

      recordedAudioRef.current = recordedAudio;
      setIsRecorderReady(false);

      console.log("audioResponse:", recordedAudio);

      const body = {
        assignmentId,
        patientId,
        audioResponse: recordedAudio,
      };
      const { data } = await axiosInstance.patch("api/do-assignment", body);
      console.log(data);

      if (!data.ok || !data.audioUpload) {
        throw new Error("Backend failed to create audio upload");
      }

      if (!recordedAudio.url) {
        throw new Error("Recorded audio URL is missing");
      }

      await uploadAudio(
        recordedAudio.url,
        data.audioUpload
      );

      router.dismissTo("/(app)/Home");
    } catch(e) {
      console.log(e);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }
  

  
  return (
    <SafeAreaView className="px-4 gap-6">
      {isLoading || isSubmitting ? (
        <View className="items-center">
          <Host matchContents>
            <CircularProgressIndicator />
          </Host>
        </View>
      ) : (
        <>
          <View className="flex gap-2">
            <View className="flex items-end">
              <Text>{currentQuestionIndex + 1}/{questionsCount}</Text>
            </View>
            <View className="flex flex-row justify-between items-center">
              {currentQuestionIndex === 0 ? (
                <Pressable
                  className={`
                    px-4 py-2 items-center w-1/3
                  `}
                >
                </Pressable>
              ) : (
                <Pressable
                  className={`
                    px-4 py-2 items-center rounded-full w-1/3 bg-sky-300 border border-sky-900
                  `}
                  onPress={() => {
                    setCurrentQuestionIndex((prev) => prev - 1);
                  }}
                >
                  <Text className="text-sky-900 font-semibold">Anterior</Text>
                  <MaterialIcons 
                    name={"arrow-back"}
                    size={20} 
                  />
                </Pressable>
              )}
              <Pressable
                className="px-4 py-2 items-center rounded-full w-1/3 bg-sky-300 border border-sky-900"
                disabled={
                  isLoading ||
                  (!isRecorderReady && !recordedAudioRef.current)
                }
                onPress={async () => {
                  if (currentQuestionIndex + 1 === Number(questionsCount)) {
                    await handleSubmit();
                  } else {
                    setCurrentQuestionIndex((prev) => prev + 1);
                  }
                }}
              >
                
                <Text className="text-sky-900 font-semibold">
                  {currentQuestionIndex + 1 === Number(questionsCount) 
                    ? "Confirmar" : "Próximo"
                  }
                </Text>
                {currentQuestionIndex + 1 !== Number(questionsCount) && (
                  <MaterialIcons 
                    name={"arrow-forward"}
                    size={20} 
                  />
                )}
              </Pressable>
            </View>

          </View>

          <View className="flex flex-col gap-6">
            <View className="flex flex-row gap-2 items-center">
              <MaterialIcons 
                name={"record-voice-over"}
                size={20} 
              />
              <Text className="text-lg">Duração: {(recorderState.durationMillis/1000).toFixed(0)}s</Text>
            </View>
            <View className="flex flex-row items-center gap-3">
              <Pressable
                className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
                onPress={() => {
                  Speech.speak(currentQuestion?.description || '', {language: "pt-BR"});
                }}
              >
                <MaterialIcons 
                  name={"play-circle"} 
                  size={25} 
                />
              </Pressable>
              <Text className="text-xl font-medium">{currentQuestion?.description}</Text>
            </View>
            
            <View className="border" >
              {currentQuestion?.imageUrl ? (
                <Image
                  source={{ uri: currentQuestion.imageUrl }}
                  style={{ width: "100%", aspectRatio: 4 / 3 }}
                  contentFit="contain"
                  cachePolicy="none"
                  onLoad={() => console.log("Image loaded!")}
                  onError={(e) => console.log("Image error:", e.error)}
                />
              ) : (
                <View className="items-center">
                  <Host matchContents>
                    <CircularProgressIndicator />
                  </Host>
                </View>
              )}
            </View>

            <View className="flex flex-row justify-evenly">

              {/* <Pressable
                className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
                onPress={async () => {
                  try {
                    if (recorderState.isRecording) {
                      await stopRecording();
                    } else {
                      await record();
                    }
                  } catch (error) {
                    console.error("Recording error:", error);
                  }
                }}
              >
                <MaterialIcons name={
                  recorderState.isRecording ? "stop-circle" : 
                "mic"} 
                  size={25} color={
                    recorderState.isRecording ? "red" : 
                  "black"} />
              </Pressable> */}

              <Pressable
                className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
                onPress={() => {
                  const invisibleTip = currentTips?.find(v => !v.visible);
                  if (invisibleTip) {
                    const newCurrentTips = currentTips?.map(v => {
                      if (v._id === invisibleTip._id) {
                        return {...v, visible: true };
                      }
                      return v;
                    });
                    setCurrentTips(newCurrentTips);
                    Speech.speak(invisibleTip.text);
                  }
                }}
              >
                <MaterialIcons name={"lightbulb"} 
                  size={20} color={visibleTip ? "#FFB703" : "black"} 
                />
              </Pressable>


            </View>

            <View className="flex flex-col gap-3">
                {currentTips?.map((tip, index) => {
                  if (tip.visible) {
                    return (
                      <View key={`question-tips-${index}`} className="flex-row gap-2 ">
                        <Pressable
                          className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
                          onPress={() => {
                            Speech.speak(tip.text || '', {language: "pt-BR"});
                          }}
                        >
                          <MaterialIcons 
                            name={
                              // descriptionAudioPlayerStatus.playing ? "pause-circle" : 
                              "play-circle"
                            } 
                            size={25} 
                          />
                        </Pressable>
                        <View className="flex-row gap-1 items-center ">
                          <Text className="text-xl text-start">{tip.text}</Text>
                        </View>
                    
                      </View>
                    );
                  }
                })}
              </View>
          </View>
        </>
      )}
    </SafeAreaView>
  )
}