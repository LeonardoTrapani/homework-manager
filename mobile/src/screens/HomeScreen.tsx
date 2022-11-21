import React, { useEffect, useMemo, useState } from "react";
import { MyHomeworkHeader } from "../components/CalendarHomeworkComponent";
//import { HomeScreenProps } from "../../types";
import { useDueCalendarDay, useValidToken } from "../util/react-query-hooks";
import moment from "moment";
import {
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  View,
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { completeHomework } from "../api/homework";
import ErrorComponent from "../components/ErrorComponent";
import {
  DueCalendarDayType,
  DueHomeworkType,
  HomeStackParamList,
} from "../../types";
import { MediumText, RegularText } from "../components/StyledText";
import { CompleteCircle, UncompleteCircle } from "./PlannedHomeworkScreen";
import { NavigationProp, useNavigation } from "@react-navigation/native";

export default function HomeScreen() {
  //{
  //navigation,
  //route,
  //}: HomeScreenProps<"Root">
  const initialDate = moment().startOf("day").toISOString();
  const [currentCalendarDate, setCurrentCalendarDate] = useState(initialDate);

  const { data, error, isError, isLoading, isFetching } = useDueCalendarDay(
    moment(currentCalendarDate)
  );
  const parsedError = error as Error | undefined;

  useEffect(() => {
    if (!data || isFetching) {
      return;
    }
    if (moment(currentCalendarDate).isSame(data.date, "days")) {
      return;
    }
    console.warn("SERVER DATE IS DIFFERENT FROM LOCAL DATE: ", {
      current: moment(currentCalendarDate).toDate(),
      server: data.date,
    });
    setCurrentCalendarDate(data.date);
  }, [currentCalendarDate, data, isFetching]);

  return (
    <View style={{ flex: 1 }}>
      <MyHomeworkHeader
        onToday={() => {
          setCurrentCalendarDate(moment().startOf("day").toISOString());
        }}
        onPageForward={() => {
          setCurrentCalendarDate((prev) => {
            return moment(prev).startOf("day").add(1, "day").toISOString();
          });
        }}
        onPageBackward={() => {
          setCurrentCalendarDate((prev) =>
            moment(prev).startOf("day").subtract(1, "day").toISOString()
          );
        }}
        onSetCalendarDate={(date: string) => setCurrentCalendarDate(date)}
        currentCalendarDate={currentCalendarDate}
      />
      <HomeHomeworkBody
        currentDate={currentCalendarDate}
        data={data}
        isError={isError}
        isLoading={isLoading}
        errorMessage={parsedError?.message}
      />
    </View>
  );
}

const HomeHomeworkBody: React.FC<{
  currentDate: string;
  isLoading: boolean;
  data: DueCalendarDayType | undefined;
  errorMessage?: string;
  isError: boolean;
}> = (props) => {
  const { data: validToken } = useValidToken();

  const qc = useQueryClient();
  const completeHomeworkMutation = useMutation(
    (data: { id: number }) => {
      return completeHomework(data.id, validToken, true);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["plannedCalendarDay"]);
        qc.invalidateQueries(["dueCalendarDay"]);
        qc.invalidateQueries(["SingleHomework"]);
      },
    }
  );

  const uncompleteHomeworkMutation = useMutation(
    (data: { id: number }) => {
      return completeHomework(data.id, validToken, false);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(["plannedCalendarDay"]);
        qc.invalidateQueries(["dueCalendarDay"]);
        qc.invalidateQueries(["SingleHomework"]);
      },
    }
  );
  const sortedHomeworkList = useMemo(() => {
    const completedHomework = props.data?.homeworkList.filter(
      (hmk) => hmk.completed === true
    );
    const notCompletedHomework = props.data?.homeworkList.filter((hmk) => {
      return hmk.completed === false;
    });
    return [...(notCompletedHomework || []), ...(completedHomework || [])];
  }, [props.data]);

  if (!props.data) {
    return <></>;
  }

  const completeHandler = (id: number) => {
    completeHomeworkMutation.mutate({ id });
  };

  const uncompleteHandler = (id: number) => {
    uncompleteHomeworkMutation.mutate({ id });
  };

  return (
    <View style={{ flex: 1 }}>
      {props.isLoading ? (
        <ActivityIndicator />
      ) : props.isError ? (
        <ErrorComponent text={props.errorMessage || ""} />
      ) : (
        <FlatList
          data={sortedHomeworkList}
          ItemSeparatorComponent={() => (
            <View style={{ marginBottom: 6, marginLeft: 40 }}></View>
          )}
          renderItem={({ item, index }) => (
            <DueHomeworkComponent
              homework={item}
              completeHandler={completeHandler}
              i={index}
              isLoading={props.isLoading}
              uncompleteHandler={uncompleteHandler}
            />
          )}
        />
      )}
    </View>
  );
};

const DueHomeworkComponent: React.FC<{
  homework: DueHomeworkType;
  isLoading: boolean;
  uncompleteHandler: (i: number) => void;
  completeHandler: (i: number) => void;
  i: number;
}> = (props) => {
  const navigation = useNavigation<NavigationProp<HomeStackParamList>>();
  const isCompleted = props.homework.completed;
  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          paddingBottom: 5,
        }}
      >
        {isCompleted ? (
          <UncompleteCircle
            isLoading={props.isLoading}
            onUncomplete={() => props.uncompleteHandler(props.homework.id)}
          />
        ) : (
          <CompleteCircle
            onComplete={() => props.completeHandler(props.homework.id)}
            isLoading={props.isLoading}
          />
        )}
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() =>
            navigation.navigate("SingleHomework", {
              homeworkId: props.homework.id,
              title: props.homework.name,
            })
          }
        >
          <MediumText style={{ fontSize: 15 }}>
            {props.homework.name}
          </MediumText>
          {!isCompleted ? (
            <RegularText>{props.homework.description}</RegularText>
          ) : (
            <></>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};
