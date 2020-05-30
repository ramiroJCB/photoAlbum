import React, { useEffect, useState, useRef, useCallback } from "react";
import usePhotoSearch from "./useSearchPhoto";
import axios from "axios";
import "./App.css";
import SweetAlert from "react-bootstrap-sweetalert";
function App() {
  const [query, setQuery] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [photoPopUp, setPhotoPopUp] = useState(false);
  const { loading, error, Photos, hasMore } = usePhotoSearch(query, pageNumber);
  useEffect(() => {
    return () => {};
  }, [Photos]);
  /*Watching which photo the user is capable  of seeing , 
  then adding new pages if the persona can see the end*/
  const observer = useRef();
  const lastBookElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );
  //Gettign Next/Prev  Photos
  const getNextPhoto = (id) => {
    let newPhoto = "";
    Photos.map((pic, key) => {
      if (pic.id === id) {
        newPhoto = Photos[key + 1].id;
      }
    });
    return newPhoto;
  };
  //Get and Especific Photo with the content
  const getPrevPhoto = (id) => {
    let newPhoto = "";
    Photos.map((pic, key) => {
      if (pic.id === id) {
        newPhoto = Photos[key - 1].id;
      }
    });
    return newPhoto;
  };
  const getPhoto = async (id) => {
    const { data } = await axios.get(
      `http://interview.agileengine.com/images/${id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    console.log(data);
    const popUp = (
      <SweetAlert title={data.id} onConfirm={() => null} showConfirm={false}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <img alt="singlePic" src={data.full_picture} />
          <label>
            {" "}
            Author :<h1>{data.author}</h1>
          </label>
          <label>
            {" "}
            camera:
            <h1>{data.camera}</h1>
          </label>
          <label>
            Tags!:
            <div style={{ display: "flex" }}>
              {data.tags.split(" ").map((tag) => (
                <p>{tag}</p>
              ))}
            </div>
          </label>
          <div styles={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => getPhoto(getPrevPhoto(data.id))}>
              previous Photo
            </button>
            <button onClick={() => setPhotoPopUp(false)}>back to Album </button>
            <button onClick={() => getPhoto(getNextPhoto(data.id))}>
              next Photo
            </button>
          </div>
        </div>
      </SweetAlert>
    );

    setPhotoPopUp(popUp);
  };
  return (
    <div>
      {photoPopUp}
      <div
        style={{
          height: "100vh",
          width: "100vw",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {Photos &&
          Photos.map((pic, key) => {
            if (Photos.length === key + 1) {
              return (
                <div ref={lastBookElementRef} key={pic.id}>
                  <img
                    onClick={() => {
                      getPhoto(pic.id);
                    }}
                    style={{ height: "25vh", margin: "2vw" }}
                    alt="pic"
                    src={pic.cropped_picture}
                  />
                </div>
              );
            } else {
              return (
                <div key={pic.id + key}>
                  <img
                    onClick={() => {
                      getPhoto(pic.id);
                    }}
                    style={{ height: "25vh", margin: "2vw" }}
                    alt="pic"
                    src={pic.cropped_picture}
                  />
                </div>
              );
            }
          })}
      </div>
      <div>{loading && "Loading..."}</div>
      <div>{error && "Error"}</div>
    </div>
  );
}

export default App;
