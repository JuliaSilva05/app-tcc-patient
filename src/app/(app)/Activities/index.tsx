import { useSession } from '@/context/ctx';
import axiosInstance from '@/services/apiConfig';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import { Link } from 'expo-router';
import { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Accordion from 'react-native-collapsible/Accordion';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import ActivityList from './ActivityList';
import {
  Host,
  CircularProgressIndicator,
} from '@expo/ui/jetpack-compose';

export default function Activities () {
  const { user } = useSession();
  const [search, setSearch] = useState("");
  const [activities, setActivities] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getActivities = async () => {
      try {
        setIsLoading(true);
        //@ts-ignore
        const user_id = JSON.parse(user)._id;

        const { data } = await axiosInstance.get(`/api/get-assignments/${user_id}`);

        console.log(data)
        
        setActivities(data?.assignments);
      } catch(e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }

    getActivities();
  }, [search]);

  return (
    <SafeAreaView>
      <KeyboardAwareScrollView contentContainerClassName="gap-3">
        {isLoading ? (
          <Host>
            <CircularProgressIndicator />
          </Host>
        ) : (
          <>
            {activities && activities?.length ? (
                <ActivityList activities={activities} />
            ) : (
              <View className="flex flex-col items-center justify-center gap-3">
                <MaterialIcons 
                  name="search-off"
                  color={"#b0afaf"} size={60}
                />
                <Text className="text-lg text-neutral-400">Nenhuma atividade encontrada.</Text>
              </View>
            )}
          </>
        )}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  )
}