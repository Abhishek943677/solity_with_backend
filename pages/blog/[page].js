import React from "react";
import Blogpostcard from "../../components/Blogpostcard";
import { mongoConnectBlogs } from "../../lib/mongoConnectBlogs";
import PaginationModal from "../../components/Pagination";

export default function Page({postList,noOfPageForPagination,UserBlogPage}) {

  return (
    <div>
      <p className="text-3xl text-center">
        Welcome to blogs at <span>solity.fun</span>
      </p>
      <div className="flex flex-row flex-wrap justify-center mx-auto my-6">
        {postList !== [] &&
          JSON.parse(postList).map((post, index) => {
            return <Blogpostcard post={post} key={index} />;
          })}
      </div>

      {postList === [] ||
        (JSON.parse(postList).length === 0 && (
          <div className="">
            <h1 className="m-6 text-center font-medium">{`Post unavailable at page ${UserBlogPage}`}</h1>
          </div>
        ))}

      <PaginationModal
        noOfPageForPagination={noOfPageForPagination}
        currentPage={UserBlogPage}
      />
    </div>
  );
}





export async function getStaticPaths() {
  const db = await mongoConnectBlogs(); // my function to connect with db
  const collectionName = "blogs";
  const collection = db.collection(collectionName); // creating collection with name of trade  // console.log(postsList)
  const postsList = await collection.estimatedDocumentCount();

  // console.log(postsList);

  // var path = [{ params: { page: "1" } }];
  var path = [];

  for (let i = 1; i <= Math.ceil(postsList / 10); i++) {
    path = [...path, { params: { page: String(i) } }];
  }

  // console.log(path);
  return {
    paths: path,
    fallback: "blocking",
  };
}

export async function getStaticProps(context) {
  const UserBlogPage = context.params.page;
  var noOfPageForPagination;

  const totalTopicsPerPage = 2;
  const skipped = totalTopicsPerPage * (Number(context.params.page) - 1);

  try {
    const db = await mongoConnectBlogs(); // my function to connect with db

    const collectionName = "blogs";
    const collection = db.collection(collectionName); // creating collection with name of trade  // console.log(postsList)

    const postList = await collection
      .find()
      .project({ seo_description: 1, title: 1, url: 1, thumbnail: 1 })
      .skip(skipped)
      .limit(totalTopicsPerPage)
      .toArray();

    // console.log(postList);

    const postsCount = await collection.estimatedDocumentCount();
    noOfPageForPagination = Math.ceil(postsCount / totalTopicsPerPage);

    return {
      props: {
        postList: JSON.stringify(postList),
        noOfPageForPagination,
        UserBlogPage,
      },
      revalidate: 600,

    };
  } catch (error) {
    return {
      props: {
        postList: [],
        noOfPageForPagination: 1,
        UserBlogPage,
      },
      revalidate: 600,
    };
  }
}
