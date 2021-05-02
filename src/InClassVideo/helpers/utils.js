export const useIntl = () => {
    return {
        formatMessage: ({ defaultMessage }) => {
            return defaultMessage
        }
    }
}

export const getParticipantInfoById = (identity) => {
    return identity;
}

export const getIdentityInfo = idparam => {
    const [id, name, isTeacher] = idparam.split("_");
    return {
      isTeacher: isTeacher ? true : false,
      name: name
    };
  };
  