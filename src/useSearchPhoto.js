import { useEffect, useState } from "react";
import axios from "axios";

export default function usePhotoSearch(query, pageNumber) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [Photos, setPhotos] = useState([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPhotos([]);
  }, [query]);

  useEffect(() => {
    setLoading(true);
    setError(false);

    let url = `${
      pageNumber > 1
        ? `http://interview.agileengine.com/images?${pageNumber}`
        : "http://interview.agileengine.com/images"
    }`;
    axios
      .post("http://interview.agileengine.com/auth", {
        apiKey: "23567b218376f79d9415",
      })
      .then((data) => {
        localStorage.setItem("token", data.data.token);
        axios
          .get(url, {
            headers: {
              Authorization: `Bearer ${data.data.token}`,
            },
          })
          .then((res) => {
            setPhotos((prevPhotos) => {
              return [
                ...prevPhotos,
                ...res.data.pictures.map((picture) => picture),
              ];
            });
            setHasMore(res.data.hasMore);
            setLoading(false);
          })
          .catch((e) => {
            setError(true);
          });
      });
  }, [query, pageNumber]);

  return { loading, error, Photos, hasMore };
}
