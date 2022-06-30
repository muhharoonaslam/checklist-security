import { useState, useEffect, useRef } from "react"
import emailjs from '@emailjs/browser';
import { db,dbF } from "./config"
import { getDatabase, ref, child, get,set } from "firebase/database";
import { addDoc, collection } from "firebase/firestore"; 

// Add a new document in collection "cities"

import { Col, Row,Tag } from 'antd';
import { Divider, Button, Modal , Form, Input, Progress,Card  } from 'antd';

import { Layout } from 'antd';

import { Checkbox,Typography  } from 'antd';
import { async } from "@firebase/util";

const { CheckableTag } = Tag;
const { Title, Paragraph, Text, Link } = Typography;
const { Header, Footer, Sider, Content } = Layout;

const App = () => {
  console.log("🚀 ~ file: App.js ~ line 23 ~ App ~ user", localStorage.getItem('user'))
  const imagePerRow = 4;

  const [next, setNext] = useState(imagePerRow);
  const [checklists, setChecklist] = useState([])
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState([]);
  const [filterCloud, setFilterCloud] = useState([]);
  const [filterService, setFilterService] = useState([]);
  const [Clouds, setClouds] = useState([]);
  const [Services, setServices] = useState([]);

  const [form] = Form.useForm()
  const form_2 = useRef();
  
  const layout = {
    labelCol: {
      span: 8,
    },
    wrapperCol: {
      span: 16,
    },
  };

  const validateMessages = {
    required: '${label} is required!',
    types: {
      email: '${label} is not a valid email!',
      number: '${label} is not a valid number!',
    },
    number: {
      range: '${label} must be between ${min} and ${max}',
    },
  };

  const handleOk = () => {
    setVisible(false);
  };

  const handleCancel = () => {
    setVisible(false);
  };
  
  const handleChange = (tag, checked) => {
    const nextSelectedTags = checked  ? [...filterCloud, tag]  : filterCloud.filter((t) => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    setFilterCloud(nextSelectedTags);
  };
  const handleChange2 = (tag, checked) => {
    const nextSelectedTags = checked
      ? [...filterService, tag]
      : filterService.filter((t) => t !== tag);
    console.log('You are interested in: ', nextSelectedTags);
    setFilterService(nextSelectedTags);
  };

  const onFinish = async (values) => {
    console.log( form.getFieldValue(['user'])?.name )
    setLoading(true)
    console.log(values,form);
    const dbRef = collection(dbF, "users");
    const docRef = await addDoc(dbRef, values)
    .then(docRef => {
        console.log("Document has been added successfully",docRef.id);
        setVisible(false);
        handleMoreImage()
        setLoading(false)

        emailjs.sendForm('service_i532uq5', 'template_ge5gwrc', form_2.current, '6xIi52MU4Oubhkle7')
        .then((result) => {
            console.log('result.text',result.text);
        }, (error) => {
            console.log(error.text);
        });
        localStorage.setItem('user', values.user)
    })
    .catch(error => {
        console.log(error,values.user);
        setLoading(false)
    })

  };
  const handleMoreImage = () => {
      setNext(checklists.length);
    };
  const onChange = (e,item,index) => {
    if (e.target.checked) {
      item[index].active = true
      setSelected([...selected, item]);
      set(ref(getDatabase(), 'checklist/' + index), item[index])
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.log(error)
      });
    } else {
      setSelected((prev) =>
        prev.filter((currItem) => currItem.active !== item.value)
      );
      item[index].active = false
      set(ref(getDatabase(), 'checklist/' + index), item[index])
      .then((data) => {
        console.log(data)
      })
      .catch((error) => {
        console.log(error)
      });
    }
    console.log(`checked = ${e.target.checked}`);
  };

     function returnPriority(params) {
      params = params.toLowerCase()
        if(params === 'high'){
          return "error"
        }
        else if(params === 'medium'){
          return "processing"
        }
        else if(params === 'low'){
          return "success"
        }
    }
    useEffect(() =>{
        const dbRef = ref(getDatabase(), "checklist");
        get(dbRef).then(async (snap) => {
          await setChecklist(snap.val())
          console.log(snap.val())
          let cloudFilters = snap.val().map((item,index) => {
            return (item.cloud)
          }).filter(function (x, i, a) { return a.indexOf(x) === i; })
          let serviceFilters = snap.val().map((item,index) => {
            return (item.category)
          }).filter(function (x, i, a) { return a.indexOf(x) === i; })
          setClouds(cloudFilters)
          setServices(serviceFilters)
          if(localStorage.getItem('user')){
            setNext(JSON.stringify(snap.val().length))
          }
        })
    },[])


    return (
     
            <Layout>
             <Layout>
               <Content
                  style={{
                    padding: 50,
                    margin: 0,
                  }}
               >
                  <Row justify="center">
                   <Col span={20}>
                    <Card >
                      <Title level={3}>Filters</Title>

                      <Row>
                        <Col span={4}><Title level={5}>Cloud Provider</Title> </Col>
                        <Col span={20}>
                          {
                              Clouds.map((item,index) => {
                                return (
                                  <CheckableTag
                                  size={"large"}
                                    key={item}
                                    checked={filterCloud.indexOf(item) > -1}
                                    onChange={(checked) => handleChange(item, checked)}
                                  >
                                    {item}
                                  </CheckableTag> 
                                )
                              }).filter(function (x, i, a) { return a.indexOf(x) === i; })
                            }
                        </Col>
                      </Row>
                      <Row>
                        <Col span={4}><Title level={5}>Services</Title></Col>
                        <Col span={20}>
                            {
                              Services.map((item,index) => {
                                return (
                                  <CheckableTag
                                  size={"large"}
                                    key={item}
                                    checked={filterService.indexOf(item) > -1}
                                    onChange={(checked) => handleChange2(item, checked)}
                                  >
                                    {item}
                                  </CheckableTag> 
                                )
                              }).filter(function (x, i, a) { return a.indexOf(x) === i; })
                            }
                        </Col>
                      </Row>
                    </Card>
                   <Progress percent={Math.trunc(checklists.filter(function(item){ return item.active}).length/checklists.length * 100)} />
                   {/* {filterService} */}
                   {filterCloud}
                      {checklists.slice(0, next).filter(function(item){ 
                        if (filterCloud.length || filterService.length) {
                          let abc= filterCloud.includes(item.cloud)
                          let abc2= filterService.includes(item.category)
                          return  abc || abc2 
                        } else {
                          return item
                        }
                       })
                        .map((item,index) => {
                          return (
                          <Row  align="middle" key={index}>
                            <Col span={1}>
                              {item.active}
                              <Checkbox checked={item.active} onChange={(event)=>onChange(event, checklists,index)}></Checkbox>
                            </Col>
                            <Col span={14}>
                              <Title level={4}>{item.group}</Title>
                              <Paragraph>
                                {item.description}
                              </Paragraph>
                             
                            </Col>
                            <Col span={3}>
                              {item.category}
                            </Col>
                            <Col span={2}>
                              {item.cloud}
                            </Col>
                            <Col span={4}>
                              <Tag color={returnPriority(item.risk)}>{item.risk.toUpperCase()}</Tag>
                            </Col>
                          </Row>
                          );
                      })}
                       <Divider />
                       {
                          next !== checklists.length ? <Button type="primary" block size="large" onClick={setVisible}>
                          Load More
                        </Button>  :""
                       }
                        
                   </Col>
                 </Row>
                <Modal title="Basic Modal" visible={visible} onOk={handleOk} onCancel={handleCancel}>
                  <form ref={form_2}>
                       <input name="name" value={Form.useWatch('user', form)?.name} hidden></input>
                       <input name="email" value={Form.useWatch('user', form)?.email} hidden></input>
                       <input name="phone" value={Form.useWatch('user', form)?.phone} hidden></input>
                       <input name="organization" value={Form.useWatch('user', form)?.organiztion} hidden></input>
                  </form>
                  { form.getFieldValue('name')}
                <Form {...layout}  form={form} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} >
                    <Form.Item
                      name={['user', 'name']}
                      label="Name"
                      rules={[
                        {
                          required: true,
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      name={['user', 'email']}
                      label="Email"
                      rules={[
                        {
                          type: 'email',
                          required: true
                        },
                      ]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item name={['user', 'organiztion']} label="Organiztion"  rules={[
                        {
                          required: true,
                        },
                      ]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={['user', 'phone']} label="Phone Number"  rules={[
                        {
                          required: true,
                        },
                      ]}>
                      <Input />
                    </Form.Item>
                    <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Submit
                      </Button>
                    </Form.Item>
                </Form>
                </Modal>
               </Content>
             </Layout>
           </Layout>
    )
}

export default App
