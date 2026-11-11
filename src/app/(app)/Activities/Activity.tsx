import axiosInstance from "@/services/apiConfig";
import { Image } from "expo-image";
import MaterialIcons from "@react-native-vector-icons/material-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Pressable, Text } from "react-native";
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


type Tips = {
  text: string;
  audio?: Audio | null;
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


export default function Activity() {
  const { assignmentId, patientId, activityId, questionsCount } = useLocalSearchParams();
  
  const [currentQuestion, setCurrentQuestion] = useState<Question>();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [audioResponse, setAudioResponse] = useState<Audio | null>();

  const record = async () => {
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
  };

  const stopRecording = async () => {
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

    setAudioResponse({
      url: uri,
      mimeType: "audio/mp4",
      durationSec,
      sizeBytes: audioFile.size,
    });

    console.log("Recorded audio:", {
      uri,
      size: audioFile.size,
      mimeType: "audio/mp4",
    });
  };

  useEffect(() => {
    const getCurrentQuestion = async () => {
      try {
        const { data } = await axiosInstance.get(`api/get-activity-questions-data/${activityId}/${currentQuestionIndex}`)

        console.log(data);
        if (data) {
          setCurrentQuestion({...data.data, imageUrl: data.imageUrl});
        }
      } catch (e) {
        console.error(e);
      }
    };

    getCurrentQuestion();

  }, [currentQuestionIndex]);

  
  const handleSubmit = async () => {
    try {
      const body = {
        assignmentId,
        patientId,
      };
      const { data } = await axiosInstance.patch("do-assignment", body);
      console.log(data)
    } catch(e) {
      console.log(e);
    }
  }
  
  return (
    <SafeAreaView className="px-4 gap-6">
      <View className="flex items-end">
        <Text>{currentQuestionIndex + 1}/{questionsCount}</Text>
        <Pressable
          className="px-4 py-2 items-center rounded-full w-1/3 bg-sky-300 border border-sky-900"
          onPress={() => {
            if (currentQuestionIndex + 1 === Number(questionsCount)) {
              handleSubmit();
            }
          }}
        >
          <Text className="text-sky-900 font-semibold">Confirmar</Text>
        </Pressable>
      </View>

      <View className="flex flex-col gap-6">
        <View className="flex flex-row items-center gap-3">
          <Pressable
            className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
            onPress={() => {
              Speech.speak(currentQuestion?.description || '', {language: "pt-BR"});
            }}
          >
            <MaterialIcons 
              name={
                // descriptionAudioPlayerStatus.playing ? "pause-circle" : 
                "play-circle"
              } 
              size={25} />
          </Pressable>
          <Text className="text-lg font-medium">{currentQuestion?.description}</Text>
        </View>
        
        <View className="border" >
            {currentQuestion?.imageUrl && (
              <Image
                source={{ uri: currentQuestion.imageUrl }}
                style={{ width: "100%", aspectRatio: 4 / 3 }}
                contentFit="contain"
                cachePolicy="none"
                onLoad={() => console.log("Image loaded!")}
                onError={(e) => console.log("Image error:", e.error)}
              />
            )}
        </View>

        <View className="flex flex-row justify-evenly">

          <Pressable
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
            // disabled={
            //   // isRecOrPlaying
            //   // descriptionAudio !== null && descriptionAudioPlayerStatus?.playing
            // }
          >
            <MaterialIcons name={
              // recorderState.isRecording ? "stop-circle" : 
              "mic"} 
              size={25} color={
                // recorderState.isRecording ? "red" : 
                "black"} />
          </Pressable>

          <Pressable
            className="w-10 h-10 border bg-neutral-200 rounded-full items-center justify-center"
            onPress={() => {
              // if (recorderState.isRecording) {
              //   setDescriptionAudio({
              //     url: recorderState.url ,
              //     mimeType: recorderState.url  ? `audio/${recorderState.url?.split(".").pop()}` : null,
              //     durationSec: Number((recorderState.durationMillis/1000).toFixed(0)),
              //     sizeBytes: recorderState.fileSize,
              //   });
              //   stopRecording();
              // } else {
              //   record();
              // }
            }}
            // disabled={
            //   // isRecOrPlaying
            //   // descriptionAudio !== null && descriptionAudioPlayerStatus?.playing
            // }
          >
            <MaterialIcons name={
              // recorderState.isRecording ? "stop-circle" : 
              "lightbulb"} 
              size={20} color={
                // recorderState.isRecording ? "red" : 
                "black"} />
          </Pressable>


        </View>
      </View>

      
    </SafeAreaView>
  )
}